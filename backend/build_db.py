import sqlite3
import json
import os
import time

DB_PATH = '/Users/deepaks/Desktop/MED/medicine.db'
JSON_DIR = '/Users/deepaks/Desktop/MED'

def create_schema(cursor):
    cursor.execute('DROP TABLE IF EXISTS product_enrichment')
    cursor.execute('DROP TABLE IF EXISTS medicine_formulations')
    cursor.execute('DROP TABLE IF EXISTS medicine_master')
    
    cursor.execute('''
    CREATE TABLE medicine_master (
        medicine_id TEXT PRIMARY KEY,
        canonical_name TEXT,
        generic_name TEXT,
        composition_display TEXT,
        composition_normalized TEXT,
        is_combination BOOLEAN,
        completeness_score REAL,
        raw_json TEXT
    )
    ''')

    cursor.execute('DROP TABLE IF EXISTS medicine_formulations')
    cursor.execute('''
    CREATE TABLE medicine_formulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine_id TEXT,
        strength TEXT,
        dosage_form TEXT,
        FOREIGN KEY (medicine_id) REFERENCES medicine_master(medicine_id)
    )
    ''')

    cursor.execute('DROP TABLE IF EXISTS product_enrichment')
    cursor.execute('''
    CREATE TABLE product_enrichment (
        product_id TEXT PRIMARY KEY,
        medicine_id TEXT,
        brand TEXT,
        manufacturer TEXT,
        strength TEXT,
        dosage_form TEXT,
        pack_size TEXT,
        price REAL,
        source TEXT,
        FOREIGN KEY (medicine_id) REFERENCES medicine_master(medicine_id)
    )
    ''')
    
    # FTS Table
    cursor.execute('DROP TABLE IF EXISTS medicine_search_fts;')
    cursor.execute('''
        CREATE VIRTUAL TABLE medicine_search_fts USING fts5(
            medicine_id UNINDEXED,
            canonical_name,
            composition_normalized,
            aliases,
            tokenize='unicode61'
        );
    ''')

def create_indexes(cursor):
    print("Creating indexes...")
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_med_comp ON medicine_master(composition_normalized)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_prod_med_id ON product_enrichment(medicine_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_form_med_id ON medicine_formulations(medicine_id)')

def load_data(conn):
    cursor = conn.cursor()
    
    # Load Master
    master_path = os.path.join(JSON_DIR, 'medicine_master.json')
    if os.path.exists(master_path):
        print("Loading medicine_master.json...")
        with open(master_path, 'r') as f:
            medicines = json.load(f)
            
        for med in medicines:
            cursor.execute('''
                INSERT INTO medicine_master 
                (medicine_id, canonical_name, generic_name, composition_display, composition_normalized, is_combination, completeness_score, raw_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                med['medicine_id'],
                med['canonical_name'],
                med['generic_name'],
                med['composition']['display'],
                med['composition']['normalized'],
                med['composition']['is_combination'],
                med['data_quality']['completeness_score'],
                json.dumps(med)
            ))
            
            for form in med.get('formulations', []):
                cursor.execute('''
                    INSERT INTO medicine_formulations (medicine_id, strength, dosage_form)
                    VALUES (?, ?, ?)
                ''', (med['medicine_id'], form.get('strength'), form.get('dosage_form')))
    
    # Load Enrichment
    enrich_path = os.path.join(JSON_DIR, 'product_enrichment.json')
    aliases_map = {}
    if os.path.exists(enrich_path):
        print("Loading product_enrichment.json...")
        with open(enrich_path, 'r') as f:
            enrichment_groups = json.load(f)
            
        for group in enrichment_groups:
            med_id = group['medicine_id']
            brands = set()
            manufacturers = set()
            for p in group.get('products', []):
                cursor.execute('''
                    INSERT OR IGNORE INTO product_enrichment 
                    (product_id, medicine_id, brand, manufacturer, strength, dosage_form, pack_size, price, source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    p['product_id'], med_id, p['brand'], p['manufacturer'], 
                    p['strength'], p['dosage_form'], p['pack_size'], p['price'], p['source']
                ))
                if p['brand']: brands.add(str(p['brand']))
                if p['manufacturer']: manufacturers.add(str(p['manufacturer']))
            
            # Combine all brands, manufacturers, and formulations into a giant alias string for FTS
            formulations_str = ""
            cursor.execute("SELECT strength, dosage_form FROM medicine_formulations WHERE medicine_id = ?", (med_id,))
            for f_row in cursor.fetchall():
                if f_row[0]: formulations_str += f_row[0] + " "
                if f_row[1]: formulations_str += f_row[1] + " "
                
            aliases_map[med_id] = " ".join(list(brands) + list(manufacturers)) + " " + formulations_str
            
    # Populate FTS
    print("Populating FTS table...")
    cursor.execute("SELECT medicine_id, canonical_name, composition_normalized FROM medicine_master")
    for row in cursor.fetchall():
        med_id = row[0]
        aliases = aliases_map.get(med_id, "")
        cursor.execute('''
            INSERT INTO medicine_search_fts(medicine_id, canonical_name, composition_normalized, aliases)
            VALUES (?, ?, ?, ?)
        ''', (med_id, row[1], row[2], aliases))

def main():
    print("Initializing Database...")
    start_time = time.time()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('PRAGMA foreign_keys = ON;')
    
    create_schema(cursor)
    load_data(conn)
    create_indexes(cursor)
    
    conn.commit()
    
    print("\nDatabase Statistics:")
    for table in ['medicine_master', 'medicine_formulations', 'product_enrichment', 'medicine_search_fts']:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        print(f"{table}: {cursor.fetchone()[0]} rows")
        
    conn.close()
    print(f"Database built successfully in {time.time() - start_time:.2f} seconds!")

if __name__ == "__main__":
    main()
