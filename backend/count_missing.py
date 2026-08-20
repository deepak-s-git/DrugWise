import pandas as pd
import json

print("Checking medicine_master_export.csv...")
meds = pd.read_csv('/Users/deepaks/Desktop/MED/medicine_master_export.csv')
med_cols = ['indications', 'side_effects', 'therapeutic_categories']
for col in med_cols:
    missing = meds[col].isna().sum()
    print(f"Missing {col}: {missing} / {len(meds)}")

print("\nChecking product_enrichment_export.csv...")
prods = pd.read_csv('/Users/deepaks/Desktop/MED/product_enrichment_export.csv')
prod_cols = ['brand', 'manufacturer', 'strength', 'dosage_form', 'pack_size', 'price']
for col in prod_cols:
    missing = prods[col].isna().sum()
    print(f"Missing {col}: {missing} / {len(prods)}")
