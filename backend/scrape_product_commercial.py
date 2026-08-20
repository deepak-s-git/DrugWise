import asyncio
import aiohttp
from bs4 import BeautifulSoup
import sqlite3
import os
import random
from fake_useragent import UserAgent
import re

DB_PATH = '/Users/deepaks/Desktop/MED/medicine.db'
ua = UserAgent()

async def fetch_product_strength(session, brand, manufacturer):
    # This attempts a DDG search to find the product strength from public indexes.
    query = f"{brand} {manufacturer} strength tablet mg"
    url = "https://html.duckduckgo.com/html/"
    headers = {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
    
    try:
        async with session.post(url, data={'q': query}, headers=headers, timeout=10) as response:
            if response.status == 200:
                html = await response.text()
                
                # Regex to find strength patterns like "500 mg", "10 mg", "500mg" in the snippets
                strength_pattern = re.compile(r'\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml)\b', re.IGNORECASE)
                
                matches = strength_pattern.findall(html)
                if matches:
                    # Return the most commonly found strength in the top results
                    # (This is a naive extraction; in production, use a more targeted scraping approach on specific pharmacy domains)
                    strengths = [f"{m[0]}{m[1].lower()}" for m in matches]
                    most_common = max(set(strengths), key=strengths.count)
                    return most_common
            elif response.status == 403:
                print("Rate Limited! Sleeping...")
                await asyncio.sleep(15)
    except Exception as e:
        pass
    
    return None

async def enrich_product_commercial():
    print("Connecting to database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Find all products missing strength
    cursor.execute("SELECT product_id, brand, manufacturer FROM product_enrichment WHERE strength IS NULL OR strength = ''")
    missing_prods = cursor.fetchall()
    print(f"Found {len(missing_prods)} products missing strength data.")
    
    # Process in much larger chunks for speed
    chunk_size = 25
    total_processed = 0
    
    # We use a connector with a limit to avoid exhausting local sockets
    connector = aiohttp.TCPConnector(limit=50)
    async with aiohttp.ClientSession(connector=connector) as session:
        for i in range(0, len(missing_prods), chunk_size):
            chunk = missing_prods[i:i+chunk_size]
            tasks = []
            for prod in chunk:
                brand = prod[1] or ""
                mfg = prod[2] or ""
                tasks.append(fetch_product_strength(session, brand, mfg))
                
            results = await asyncio.gather(*tasks)
            
            updates = []
            for j, strength in enumerate(results):
                if strength:
                    prod_id = chunk[j][0]
                    updates.append((strength, prod_id))
                    
            if updates:
                cursor.executemany("UPDATE product_enrichment SET strength = ? WHERE product_id = ?", updates)
                conn.commit()
                print(f"Updated {len(updates)} records in this batch.")
                
            total_processed += len(chunk)
            print(f"Processed {total_processed}/{len(missing_prods)} products... ({len(updates)} found)")
            
            # Tiny jitter to prevent instant bans but keep it fast
            await asyncio.sleep(random.uniform(0.5, 1.5))
            
    conn.close()
    print("Phase 2: Product Enrichment Complete!")

if __name__ == "__main__":
    asyncio.run(enrich_product_commercial())
