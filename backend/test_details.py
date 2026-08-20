from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_detail_apis():
    # 1. Search for a product to get an ID
    search_res = client.get("/api/search?q=Cetzine")
    search_data = search_res.json()
    assert search_data['total'] > 0
    top_product = search_data['results'][0]
    
    prod_id = top_product['product_id']
    med_id = top_product['medicine_id']
    
    # 2. Test Product Details API
    print(f"\n--- Testing Product Details API: {prod_id} ---")
    prod_res = client.get(f"/api/product/{prod_id}")
    assert prod_res.status_code == 200
    prod_data = prod_res.json()
    
    print(f"Product Name: {prod_data['product']['original_name']}")
    print(f"Parent Medicine Comp: {prod_data['parent_medicine']['norm_comp']}")
    print(f"Number of prices found: {len(prod_data['prices'])}")
    print(f"Provenance records found: {len(prod_data['provenance'])}")
    assert 'prices' in prod_data
    assert 'provenance' in prod_data
    
    # 3. Test Medicine Details API
    print(f"\n--- Testing Medicine Details API: {med_id} ---")
    med_res = client.get(f"/api/medicine/{med_id}")
    assert med_res.status_code == 200
    med_data = med_res.json()
    
    print(f"Medicine Comp: {med_data['medicine']['norm_comp']}")
    print(f"Linked Products Count: {med_data['linked_products_count']}")
    print(f"Available Manufacturers: {len(med_data['manufacturers'])}")
    assert 'medicine' in med_data
    assert 'linked_products_count' in med_data

if __name__ == "__main__":
    test_detail_apis()
    print("\n✅ All detail API tests passed!")
