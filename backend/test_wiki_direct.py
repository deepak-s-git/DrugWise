import requests

def get_wiki_sections(medicine_name):
    headers = {"User-Agent": "MedilensBot/1.0 (test@example.com)"}
    search_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": medicine_name,
        "utf8": "",
        "format": "json",
        "srlimit": 1
    }
    r = requests.get(search_url, params=params, headers=headers).json()
    if not r.get("query", {}).get("search"):
        return None, None
        
    title = r["query"]["search"][0]["title"]
    
    params = {
        "action": "query",
        "prop": "extracts",
        "titles": title,
        "explaintext": True,
        "format": "json"
    }
    r = requests.get(search_url, params=params, headers=headers).json()
    pages = r.get("query", {}).get("pages", {})
    page_text = list(pages.values())[0].get("extract", "")
    
    side_effects = []
    interactions = []
    
    current_section = None
    for line in page_text.split('\n'):
        if line.startswith('=') and line.endswith('='):
            sec_name = line.strip('=').strip().lower()
            if "side effect" in sec_name or "adverse effect" in sec_name:
                current_section = 'se'
            elif "interaction" in sec_name:
                current_section = 'int'
            else:
                current_section = None
        elif current_section == 'se':
            if line.strip(): side_effects.append(line.strip())
        elif current_section == 'int':
            if line.strip(): interactions.append(line.strip())
            
    return side_effects, interactions

se, inter = get_wiki_sections("Amoxicillin/clavulanic acid")
print("SE:", len(se))
print("INT:", len(inter))
