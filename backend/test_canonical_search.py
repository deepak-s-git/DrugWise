import api
import asyncio

queries = [
    "CETIRIZINE",
    "Dolo 650",
    "Paracetamol",
    "Cetirizine 10 mg",
    "Cetirizine tablet",
    "Amoxicillin",
    "Augmentin 625",
    "Pantoprazole",
    "Rabeprazole"
]

print("=== CANONICAL SEARCH TEST ===")
for q in queries:
    res = api.search_medicine(q=q, limit=5)
    print(f"\nQuery: '{q}'")
    print(f"Total Canonical Results: {res['total']}")
    if res['total'] > 0:
        top = res['results'][0]
        print(f"Top Match: {top['canonical_name']} (Score: {top['relevance_score']})")
        print(f"Formulations count: {len(top.get('formulations', []))}")
        if 'corrected_query' in res:
            print(f"Corrected via SymSpell: {res['corrected_query']}")

print("\nDONE")
