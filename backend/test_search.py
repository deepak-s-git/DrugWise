from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_exact_brand_ranking():
    print("\n--- Testing Exact Brand Ranking: 'Cetzine' ---")
    response = client.get("/api/search?q=Cetzine")
    assert response.status_code == 200
    data = response.json()
    assert data['total'] > 0
    results = data['results']
    print(f"Total found: {data['total']}")
    
    # The first result should ideally be an exact brand match
    top_result = results[0]
    print(f"Top result: {top_result['product_name']} ({top_result['composition']})")
    assert 'cetzine' in top_result['product_name'].lower(), "Brand name should contain 'cetzine'"

def test_exact_generic_ranking():
    print("\n--- Testing Exact Generic Ranking: 'Cetirizine' ---")
    response = client.get("/api/search?q=Cetirizine")
    data = response.json()
    results = data['results']
    
    top_result = results[0]
    print(f"Top result: {top_result['product_name']} ({top_result['composition']})")
    assert 'cetirizine' in top_result['composition'].lower(), "Composition should contain 'cetirizine'"

def test_fuzzy_multi_token():
    print("\n--- Testing Fuzzy/Multi-token Ranking: 'Dolo 650' ---")
    response = client.get("/api/search?q=Dolo 650")
    data = response.json()
    results = data['results']
    
    top_result = results[0]
    print(f"Top result: {top_result['product_name']} ({top_result['composition']}) | Strength: {top_result['strength']}")
    assert 'dolo' in top_result['product_name'].lower(), "Should find Dolo"

def test_manufacturer():
    print("\n--- Testing Manufacturer Search: 'Cipla' ---")
    response = client.get("/api/search?q=Cipla")
    data = response.json()
    results = data['results']
    
    top_result = results[0]
    print(f"Top result: {top_result['product_name']} by {top_result['manufacturer']}")
    assert 'cipla' in top_result['manufacturer'].lower(), "Manufacturer should contain 'cipla'"

if __name__ == "__main__":
    test_exact_brand_ranking()
    test_exact_generic_ranking()
    test_fuzzy_multi_token()
    test_manufacturer()
    print("\n✅ All search tests passed!")
