import pandas as pd
import re
prods = pd.read_csv('/Users/deepaks/Desktop/MED/product_records.csv')
strength_pattern = re.compile(r'\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|gm|ml)\b', re.IGNORECASE)

extractable = 0
for name in prods['original_name'].dropna():
    if strength_pattern.findall(name):
        extractable += 1
print(f"Extractable from CSV original_name: {extractable}")
