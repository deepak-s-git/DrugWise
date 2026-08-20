import sqlite3
import re
import time

conn = sqlite3.connect('/Users/deepaks/Desktop/MED/medicine.db')
cursor = conn.cursor()

cursor.execute("SELECT product_id, brand FROM product_enrichment WHERE strength IS NULL OR strength = ''")
missing = cursor.fetchall()

# Regex to capture things like "500 mg", "500mg", or just "500" before forms like Tablet, Capsule, Syrup, Injection
patterns = [
    re.compile(r'\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml|iu)\b', re.IGNORECASE),
    re.compile(r'\b(\d+(?:\.\d+)?)\s*(?:Tablet|Capsule|Injection|Syrup|Suspension|Drops)\b', re.IGNORECASE)
]

updates = []
for row in missing:
    pid, brand = row
    if not brand: continue
    
    strength = None
    for p in patterns:
        matches = p.findall(brand)
        if matches:
            match = matches[0]
            if isinstance(match, tuple):
                strength = f"{match[0]}{match[1].lower()}"
            else:
                strength = f"{match}mg" # Default to mg if no unit
            break
            
    if strength:
        updates.append((strength, pid))

print(f"Total missing: {len(missing)}")
print(f"Extractable locally via Regex: {len(updates)}")

t0 = time.time()
cursor.executemany("UPDATE product_enrichment SET strength = ? WHERE product_id = ?", updates)
conn.commit()
print(f"Database updated in {time.time() - t0:.2f} seconds!")

