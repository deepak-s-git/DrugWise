import wikipedia

def get_medicine_info(medicine_name):
    try:
        # Search for the medicine
        search_results = wikipedia.search(medicine_name)
        if not search_results:
            return None, None
            
        page = wikipedia.page(search_results[0])
        
        # Look for Side Effects / Adverse Effects sections
        side_effects = None
        interactions = None
        
        for section in page.sections:
            lower_sec = section.lower()
            if "side effect" in lower_sec or "adverse effect" in lower_sec:
                side_effects = page.section(section)
            elif "interaction" in lower_sec:
                interactions = page.section(section)
                
        return side_effects, interactions
    except Exception as e:
        print(f"Error: {e}")
        return None, None

print(get_medicine_info("Amoxicillin/clavulanic acid"))
