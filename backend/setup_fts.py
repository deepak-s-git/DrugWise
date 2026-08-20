import sqlite3
import time

DB_PATH = '/Users/deepaks/Desktop/MED/medicine.db'

def setup_fts():
    print("Setting up FTS5 Virtual Table...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    start_time = time.time()
    
    # Create the FTS5 table
    # We use 'tokenize="porter unicode61"' for stemming and better tokenization,
    # but since medicine names don't stem well in English, 'unicode61' alone is safer.
    cursor.execute('DROP TABLE IF EXISTS product_search_fts;')
    cursor.execute('''
        CREATE VIRTUAL TABLE product_search_fts USING fts5(
            product_id UNINDEXED,
            medicine_id UNINDEXED,
            brand_name,
            generic_comp,
            manufacturer,
            tokenize='unicode61'
        );
    ''')
    
    print("Populating FTS5 table with product data...")
    # Insert data by joining product_records and medicine_entities
    cursor.execute('''
        INSERT INTO product_search_fts(product_id, medicine_id, brand_name, generic_comp, manufacturer)
        SELECT 
            p.product_id,
            p.medicine_id,
            p.norm_name,
            m.norm_comp,
            p.manufacturer
        FROM product_records p
        JOIN medicine_entities m ON p.medicine_id = m.medicine_id;
    ''')
    
    conn.commit()
    
    cursor.execute("SELECT COUNT(*) FROM product_search_fts")
    count = cursor.fetchone()[0]
    print(f"FTS5 table populated with {count} rows in {time.time() - start_time:.2f} seconds.")
    
    conn.close()

if __name__ == "__main__":
    setup_fts()
