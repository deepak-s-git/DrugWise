import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re
from fake_useragent import UserAgent

ua = UserAgent()

async def fetch_product_strength():
    query = "Acamprol Tablet strength tablet mg"
    url = "https://html.duckduckgo.com/html/"
    headers = {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, data={'q': query}, headers=headers, timeout=10) as response:
            print(f"Status Code: {response.status}")
            if response.status == 200:
                html = await response.text()
                
                # Regex to find strength patterns like "500 mg", "10 mg", "500mg" in the snippets
                strength_pattern = re.compile(r'\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml)\b', re.IGNORECASE)
                
                matches = strength_pattern.findall(html)
                print(f"Matches found: {matches}")
                if matches:
                    strengths = [f"{m[0]}{m[1].lower()}" for m in matches]
                    most_common = max(set(strengths), key=strengths.count)
                    print(f"Most common: {most_common}")
                else:
                    print("No matches. HTML sample:")
                    print(html[:500])
            else:
                print(f"Failed with status: {response.status}")

asyncio.run(fetch_product_strength())
