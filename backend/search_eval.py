import time
from fastapi.testclient import TestClient
from api import app

TEST_CASES = [
    # 1. Exact Brand Hits
    {"category": "Exact Brand", "query": "Cetzine", "expected": "cetzine"},
    {"category": "Exact Brand", "query": "Dolo", "expected": "dolo"},
    {"category": "Exact Brand", "query": "Augmentin", "expected": "augmentin"},
    {"category": "Exact Brand", "query": "Pantocid", "expected": "pantocid"},
    {"category": "Exact Brand", "query": "Crocin", "expected": "crocin"},
    {"category": "Exact Brand", "query": "Allegra", "expected": "allegra"},
    {"category": "Exact Brand", "query": "Ciplox", "expected": "ciplox"},
    {"category": "Exact Brand", "query": "Combiflam", "expected": "combiflam"},
    {"category": "Exact Brand", "query": "Zifi", "expected": "zifi"},
    {"category": "Exact Brand", "query": "Volini", "expected": "volini"},

    # 2. Exact Generic Hits
    {"category": "Exact Generic", "query": "Cetirizine", "expected_generic": "cetirizine"},
    {"category": "Exact Generic", "query": "Paracetamol", "expected_generic": "paracetamol"},
    {"category": "Exact Generic", "query": "Amoxicillin", "expected_generic": "amoxicillin"},
    {"category": "Exact Generic", "query": "Pantoprazole", "expected_generic": "pantoprazole"},
    {"category": "Exact Generic", "query": "Ibuprofen", "expected_generic": "ibuprofen"},
    {"category": "Exact Generic", "query": "Azithromycin", "expected_generic": "azithromycin"},
    {"category": "Exact Generic", "query": "Diclofenac", "expected_generic": "diclofenac"},
    {"category": "Exact Generic", "query": "Metformin", "expected_generic": "metformin"},
    {"category": "Exact Generic", "query": "Omeprazole", "expected_generic": "omeprazole"},
    {"category": "Exact Generic", "query": "Levocetirizine", "expected_generic": "levocetirizine"},

    # 3. Multi-token Variations (Brand + Strength/Suffix)
    {"category": "Multi-token", "query": "Augmentin 625", "expected": "augmentin"},
    {"category": "Multi-token", "query": "Dolo 650", "expected": "dolo"},
    {"category": "Multi-token", "query": "Pantocid DSR", "expected": "pantocid"},
    {"category": "Multi-token", "query": "Calpol 500", "expected": "calpol"},
    {"category": "Multi-token", "query": "Zifi 200", "expected": "zifi"},
    {"category": "Multi-token", "query": "Allegra 120", "expected": "allegra"},
    {"category": "Multi-token", "query": "Crocin Advance", "expected": "crocin"},
    {"category": "Multi-token", "query": "Shelcal 500", "expected": "shelcal"},
    {"category": "Multi-token", "query": "Thyronorm 50", "expected": "thyronorm"},
    {"category": "Multi-token", "query": "Pan 40", "expected": "pan"},

    # 4. Common Indian Misspellings (Testing Fuzzy/Edit Distance)
    {"category": "Misspellings", "query": "Cetzene", "expected": "cetzine"}, 
    {"category": "Misspellings", "query": "Paracetmol", "expected_generic": "paracetamol"},
    {"category": "Misspellings", "query": "Amozyllin", "expected_generic": "amoxicillin"},
    {"category": "Misspellings", "query": "Pantoprazol", "expected_generic": "pantoprazole"},
    {"category": "Misspellings", "query": "Dollo 650", "expected": "dolo"},
    {"category": "Misspellings", "query": "Ebuprofen", "expected_generic": "ibuprofen"},
    {"category": "Misspellings", "query": "Omez", "expected": "omez"}, 
    {"category": "Misspellings", "query": "Crocine", "expected": "crocin"},
    {"category": "Misspellings", "query": "Asithromycin", "expected_generic": "azithromycin"},
    {"category": "Misspellings", "query": "Aligra", "expected": "allegra"}
]

def evaluate_search():
    results = {
        "Exact Brand": {"total": 0, "top1": 0, "top5": 0},
        "Exact Generic": {"total": 0, "top1": 0, "top5": 0},
        "Multi-token": {"total": 0, "top1": 0, "top5": 0},
        "Misspellings": {"total": 0, "top1": 0, "top5": 0}
    }
    
    start_time = time.time()
    total_latency = 0
    failures = []
    
    with TestClient(app) as client:
        for case in TEST_CASES:
            category = case["category"]
            query = case["query"]
            expected_brand = case.get("expected")
            expected_generic = case.get("expected_generic")
            
            t0 = time.time()
            res = client.get(f"/api/search?q={query}")
            latency = time.time() - t0
            total_latency += latency
            
            data = res.json()
            hits = data.get("results", [])
            
            results[category]["total"] += 1
            
            def is_match(hit):
                if expected_brand and expected_brand in hit.get("product_name", "").lower():
                    return True
                if expected_generic and expected_generic in hit.get("composition", "").lower():
                    return True
                return False
                
            top1_match = False
            top5_match = False
            
            if hits:
                if is_match(hits[0]):
                    top1_match = True
                for hit in hits[:5]:
                    if is_match(hit):
                        top5_match = True
                        break
                        
            if top1_match:
                results[category]["top1"] += 1
            if top5_match:
                results[category]["top5"] += 1
                
            if not top5_match:
                failures.append({
                    "query": query,
                    "category": category,
                    "found_count": len(hits)
                })

    avg_latency = (total_latency / len(TEST_CASES)) * 1000
    
    print("\n" + "="*50)
    print("SEARCH QUALITY EVALUATION REPORT")
    print("="*50)
    print(f"Total Queries Tested: {len(TEST_CASES)}")
    print(f"Average API Latency: {avg_latency:.2f} ms")
    
    print("\n--- METRICS BY CATEGORY ---")
    for cat, metrics in results.items():
        if metrics['total'] == 0:
            continue
        top1_pct = (metrics['top1'] / metrics['total']) * 100
        top5_pct = (metrics['top5'] / metrics['total']) * 100
        print(f"{cat}:")
        print(f"  - Top 1 Recall: {top1_pct:.1f}% ({metrics['top1']}/{metrics['total']})")
        print(f"  - Top 5 Recall: {top5_pct:.1f}% ({metrics['top5']}/{metrics['total']})")
        
    print("\n--- FAILURES (Did not appear in Top 5) ---")
    if not failures:
        print("None! Perfect recall.")
    else:
        for f in failures:
            print(f"[FAIL] Query: '{f['query']}' | Category: {f['category']} | Results returned: {f['found_count']}")
            
if __name__ == "__main__":
    evaluate_search()
