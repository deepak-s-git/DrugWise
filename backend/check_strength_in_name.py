import sqlite3
import re

conn = sqlite3.connect('/Users/deepaks/Desktop/MED/medicine.db')
cursor = conn.cursor()

cursor.execute("SELECT product_id, brand FROM product_enrichment WHERE strength IS NULL OR strength = ''")
rows = cursor.fetchall()

strength_pattern = re.compile(r'\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml)\b', re.IGNORECASE)

extractable = 0
for row in rows:
    brand = row[1] or ""
    matches = strength_pattern.findall(brand)
    if matches:
        extractable += 1

print(f"Total missing: {len(rows)}")
print(f"Extractable from brand name: {extractable}")

