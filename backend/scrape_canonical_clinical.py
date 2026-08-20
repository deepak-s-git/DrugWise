import asyncio
import aiohttp
from bs4 import BeautifulSoup
import json
import os
import random
from fake_useragent import UserAgent
import time
import sqlite3

JSON_DIR = '/Users/deepaks/Desktop/MED'
MASTER_FILE = os.path.join(JSON_DIR, 'medicine_master.json')

ua = UserAgent()

async def fetch_duckduckgo_summary(session, medicine_name):
    query = f"{medicine_name} medicine uses side effects"
    url = "https://html.duckduckgo.com/html/"
    headers = {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    try:
        async with session.post(url, data={'q': query}, headers=headers, timeout=10) as response:
            if response.status == 200:
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                snippets = soup.find_all('a', class_='result__snippet')
                
                if snippets:
                    # Combine top 3 snippets for a rich summary
                    combined = " ".join([s.get_text() for s in snippets[:3]])
                    return combined
            elif response.status == 403:
                print("DuckDuckGo Rate Limited! Sleeping...")
                await asyncio.sleep(10)
    except Exception as e:
        pass
    
    return None

def parse_summary_to_fields(summary_text):
    # Extremely basic NLP fallback mapping
    uses = []
    side_effects = []
    
    summary_lower = summary_text.lower()
    
    # Common side effect keywords
    se_keywords = ['nausea', 'vomiting', 'headache', 'dizziness', 'diarrhea', 'constipation', 'rash', 'drowsiness', 'fatigue']
    for kw in se_keywords:
        if kw in summary_lower:
            side_effects.append(kw.capitalize())
            
    # Common uses keywords
    use_keywords = ['pain', 'fever', 'infection', 'inflammation', 'hypertension', 'diabetes', 'allergies', 'asthma', 'ulcer', 'cough']
    for kw in use_keywords:
        if kw in summary_lower:
            uses.append(kw.capitalize())
            
    return uses, side_effects

async def enrich_canonical_medicines():
    print("Loading medicine_master.json...")
    with open(MASTER_FILE, 'r') as f:
        medicines = json.load(f)
        
    missing_meds = [m for m in medicines if not m.get('indications') or not m.get('side_effects')]
    print(f"Found {len(missing_meds)} canonical medicines missing clinical data.")
    
    # Process in small chunks to avoid bans
    chunk_size = 10
    total_processed = 0
    
    async with aiohttp.ClientSession() as session:
        for i in range(0, len(missing_meds), chunk_size):
            chunk = missing_meds[i:i+chunk_size]
            tasks = []
            for med in chunk:
                tasks.append(fetch_duckduckgo_summary(session, med['canonical_name']))
                
            results = await asyncio.gather(*tasks)
            
            for j, summary in enumerate(results):
                if summary:
                    med = chunk[j]
                    uses, side_effects = parse_summary_to_fields(summary)
                    
                    if not med.get('indications') and uses:
                        med['indications'] = uses
                    if not med.get('side_effects') and side_effects:
                        med['side_effects'] = side_effects
                        
                    # Also append the raw snippet to description if empty
                    if not med.get('description'):
                        med['description'] = summary
                        
            total_processed += len(chunk)
            print(f"Processed {total_processed}/{len(missing_meds)} canonical medicines...")
            
            # Save checkpoint
            with open(MASTER_FILE, 'w') as f:
                json.dump(medicines, f, indent=2)
                
            # Random jitter between 2 to 5 seconds
            await asyncio.sleep(random.uniform(2, 5))
            
    print("Phase 1: Canonical Clinical Enrichment Complete!")

if __name__ == "__main__":
    asyncio.run(enrich_canonical_medicines())
