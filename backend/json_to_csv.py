import pandas as pd
import json
import os

JSON_DIR = '/Users/deepaks/Desktop/MED'
OUT_DIR = '/Users/deepaks/Desktop/MED'

def flatten_master():
    print("Converting medicine_master.json to CSV...")
    with open(os.path.join(JSON_DIR, 'medicine_master.json'), 'r') as f:
        data = json.load(f)
        
    flat_data = []
    for med in data:
        # Format formulations nicely
        forms = []
        for f in med.get('formulations', []):
            s = f.get('strength', '')
            d = f.get('dosage_form', '')
            forms.append(f"{s} {d}".strip())
            
        flat_med = {
            'medicine_id': med['medicine_id'],
            'canonical_name': med['canonical_name'],
            'composition_normalized': med['composition']['normalized'],
            'is_combination': med['composition']['is_combination'],
            'formulations': " | ".join(forms),
            'indications': " | ".join(med.get('indications', [])),
            'side_effects': " | ".join(med.get('side_effects', [])),
            'therapeutic_categories': " | ".join(med.get('therapeutic_categories', [])),
            'completeness_score': med['data_quality']['completeness_score']
        }
        flat_data.append(flat_med)
        
    df = pd.DataFrame(flat_data)
    out_path = os.path.join(OUT_DIR, 'medicine_master_export.csv')
    df.to_csv(out_path, index=False)
    print(f"Saved {out_path}")

def flatten_enrichment():
    print("Converting product_enrichment.json to CSV...")
    with open(os.path.join(JSON_DIR, 'product_enrichment.json'), 'r') as f:
        data = json.load(f)
        
    flat_data = []
    for group in data:
        med_id = group['medicine_id']
        for p in group.get('products', []):
            flat_data.append({
                'medicine_id': med_id,
                'product_id': p.get('product_id'),
                'brand': p.get('brand'),
                'manufacturer': p.get('manufacturer'),
                'strength': p.get('strength'),
                'dosage_form': p.get('dosage_form'),
                'pack_size': p.get('pack_size'),
                'price': p.get('price')
            })
            
    df = pd.DataFrame(flat_data)
    out_path = os.path.join(OUT_DIR, 'product_enrichment_export.csv')
    df.to_csv(out_path, index=False)
    print(f"Saved {out_path}")

if __name__ == "__main__":
    flatten_master()
    flatten_enrichment()
    print("Conversion complete!")
