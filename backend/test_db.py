import sqlite3

def test_database():
    print("Testing medicine.db...")
    conn = sqlite3.connect('/Users/deepaks/Desktop/MED/medicine.db')
    cursor = conn.cursor()
    
    # Test 1: Verify Foreign Keys are intact
    cursor.execute("PRAGMA foreign_key_check;")
    fk_violations = cursor.fetchall()
    if fk_violations:
        print("❌ FAILED: Foreign key violations detected!")
        for v in fk_violations:
            print(v)
    else:
        print("✅ PASSED: All Foreign Key relationships are valid.")
        
    # Test 2: Verify Tables have data
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall() if row[0] != 'sqlite_sequence']
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        if count > 0:
            print(f"✅ PASSED: Table '{table}' contains {count} rows.")
        else:
            print(f"❌ FAILED: Table '{table}' is empty!")
            
    # Test 3: Relational Lookup Test
    print("\n--- Relational Lookup Test: 'Cetirizine' ---")
    query = """
    SELECT p.original_name, m.norm_comp, p.strength, pr.price_inr
    FROM product_records p
    JOIN medicine_entities m ON p.medicine_id = m.medicine_id
    LEFT JOIN product_prices pr ON p.product_id = pr.product_id
    WHERE p.norm_name LIKE '%cetzine%'
    LIMIT 3;
    """
    cursor.execute(query)
    results = cursor.fetchall()
    if results:
        print("✅ PASSED: Successfully joined products, medicines, and prices.")
        for row in results:
            print(f"   Result: Brand: {row[0]} | Generic: {row[1]} | Strength: {row[2]} | Price: ₹{row[3]}")
    else:
        print("❌ FAILED: Could not retrieve test data.")
        
    conn.close()

if __name__ == "__main__":
    test_database()
