import pandas as pd
import re

print("Loading data...")
meds = pd.read_csv("medicine_entities.csv")
prods = pd.read_csv("product_records.csv")

print(f"Total medicine_entities rows: {len(meds)}")
print(f"Total product_records rows: {len(prods)}")

# Analyze manufacturer duplication
dupe_meds_by_comp = meds['norm_comp'].value_counts()
print(f"Unique norm_comp values in medicine_entities: {len(dupe_meds_by_comp)}")

def strip_strength(comp):
    if not isinstance(comp, str): return ""
    # Remove things like (10mg), (5mg/5ml), etc.
    cleaned = re.sub(r'\([^)]*\)', '', comp)
    return cleaned.strip()

meds['canonical_comp'] = meds['norm_comp'].apply(strip_strength)
unique_canonical = meds['canonical_comp'].nunique()

print(f"Unique canonical compositions (strength removed): {unique_canonical}")

# Let's see how many products Paracetamol has
paracetamol_meds = meds[meds['canonical_comp'].str.contains('paracetamol', case=False, na=False)]
paracetamol_prods = prods[prods['medicine_id'].isin(paracetamol_meds['medicine_id'])]
print(f"Total Paracetamol related products: {len(paracetamol_prods)}")

print("Analysis complete.")
