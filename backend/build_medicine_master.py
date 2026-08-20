import pandas as pd
import json
import re
import os
import time

CSV_DIR = '/Users/deepaks/Desktop/MED'
OUT_DIR = '/Users/deepaks/Desktop/MED'

def normalize_composition(comp: str) -> str:
    if pd.isna(comp) or not isinstance(comp, str):
        return "Unknown"
    cleaned = re.sub(r'\([^)]*\)', '', comp)
    ingredients = [i.strip().lower() for i in cleaned.split('+')]
    ingredients = [i for i in ingredients if i]
    ingredients.sort()
    return " + ".join(ingredients)

def merge_drug_interactions(interaction_strings):
    merged = {"drug": [], "brand": [], "effect": []}
    seen = set()
    for int_str in interaction_strings:
        if pd.isna(int_str) or not int_str.strip():
            continue
        try:
            parsed = json.loads(int_str)
            for d, b, e in zip(parsed.get('drug', []), parsed.get('brand', []), parsed.get('effect', [])):
                key = f"{d}-{b}-{e}"
                if key not in seen:
                    seen.add(key)
                    merged['drug'].append(d)
                    merged['brand'].append(b)
                    merged['effect'].append(e)
        except:
            pass
    return merged

def safe_split(text):
    if pd.isna(text) or not str(text).strip(): return []
    return [t.strip() for t in re.split(r'[,|;|\n]', str(text)) if t.strip()]

def build_master():
    t0 = time.time()
    print("Loading raw CSV data...")
    meds = pd.read_csv(os.path.join(CSV_DIR, 'medicine_entities.csv'))
    prods = pd.read_csv(os.path.join(CSV_DIR, 'product_records.csv'))
    prices = pd.read_csv(os.path.join(CSV_DIR, 'product_prices.csv'))
    
    print("Normalizing compositions...")
    meds['canonical_comp'] = meds['norm_comp'].apply(normalize_composition)
    
    print("Indexing products and prices...")
    prices_dict = prices.set_index('product_id')['price_inr'].to_dict()
    prods_by_med = prods.groupby('medicine_id')
    
    canonical_meds = []
    product_enrichment = []
    
    groups = meds.groupby('canonical_comp')
    total_meds = len(groups)
    print(f"Discovered {total_meds} unique canonical compositions.")
    
    qa_report = {
        "total_canonical_medicines": total_meds,
        "total_formulations": 0,
        "duplicate_medicines_eliminated": len(meds) - total_meds,
        "manufacturer_duplicates_eliminated": 0,
        "brand_duplicates_eliminated": 0,
        "medicines_with_rich_information": 0
    }
    
    resolution_review = []
    cmed_idx = 1
    
    print("Processing canonical groups...")
    for comp_name, group in groups:
        if not comp_name or comp_name == "Unknown":
            continue
            
        cmed_id = f"CMED_{str(cmed_idx).zfill(6)}"
        cmed_idx += 1
        
        old_med_ids = group['medicine_id'].tolist()
        
        group_prods_list = []
        for mid in old_med_ids:
            if mid in prods_by_med.groups:
                group_prods_list.append(prods_by_med.get_group(mid))
                
        if group_prods_list:
            group_prods = pd.concat(group_prods_list)
        else:
            group_prods = pd.DataFrame(columns=prods.columns)
            
        qa_report['manufacturer_duplicates_eliminated'] += len(group_prods) - group_prods['manufacturer'].nunique()
        qa_report['brand_duplicates_eliminated'] += len(group_prods) - group_prods['norm_name'].nunique()
        
        formulations_map = {}
        products_list = []
        
        for _, prow in group_prods.iterrows():
            s = str(prow.get('strength', '')).strip()
            if s == 'nan' or not s: s = None
            d = str(prow.get('dosage_form', '')).strip().capitalize()
            if d == 'Nan' or not d: d = None
            
            if s or d:
                key = f"{s}-{d}"
                if key not in formulations_map:
                    formulations_map[key] = {"strength": s, "dosage_form": d, "route": None}
            
            pid = prow['product_id']
            products_list.append({
                "product_id": pid,
                "brand": str(prow['original_name']),
                "manufacturer": str(prow['manufacturer']) if pd.notna(prow['manufacturer']) else None,
                "strength": str(prow['strength']) if pd.notna(prow['strength']) else None,
                "dosage_form": str(prow['dosage_form']) if pd.notna(prow['dosage_form']) else None,
                "pack_size": str(prow['pack_size']) if pd.notna(prow['pack_size']) else None,
                "price": prices_dict.get(pid),
                "source": "D1"
            })
                    
        formulations = list(formulations_map.values())
        qa_report['total_formulations'] += len(formulations)
        
        categories = list(set([c.strip() for c in group['category'].dropna() if c.strip()]))
        indications = list(set([i for sublist in group['indication'].apply(safe_split) for i in sublist]))
        side_effects = list(set([i for sublist in group['side_effects'].apply(safe_split) for i in sublist]))
        drug_interactions = merge_drug_interactions(group['drug_interactions'].tolist())
        
        has_rich_info = len(indications) > 0 or len(side_effects) > 0 or len(drug_interactions['drug']) > 0
        if has_rich_info:
            qa_report['medicines_with_rich_information'] += 1
            
        is_combo = " + " in comp_name
        active_ingredients = [{"name": i.title(), "normalized_name": i} for i in comp_name.split(" + ")]
        display_name = " + ".join([i["name"] for i in active_ingredients])
        
        canonical_med = {
            "medicine_id": cmed_id,
            "canonical_name": display_name,
            "generic_name": display_name,
            "synonyms": [],
            "active_ingredients": active_ingredients,
            "composition": {
                "display": display_name,
                "normalized": comp_name,
                "is_combination": is_combo
            },
            "formulations": formulations,
            "therapeutic_categories": categories,
            "sub_categories": [],
            "indications": indications,
            "uses": [],
            "description": None,
            "side_effects": side_effects,
            "drug_interactions": drug_interactions,
            "classification": [],
            "images": [],
            "source_datasets": ["D1", "D3", "D4"],
            "data_quality": {
                "completeness_score": (1 if has_rich_info else 0.5),
                "confidence": "high"
            }
        }
        
        canonical_meds.append(canonical_med)
        
        product_enrichment.append({
            "medicine_id": cmed_id,
            "products": products_list
        })
        
        if len(resolution_review) < 50:
            resolution_review.append({
                "canonical_id": cmed_id,
                "canonical_composition": comp_name,
                "original_medicine_records_collapsed": len(group),
                "original_products_collapsed": len(group_prods),
                "sample_original_comp": group['norm_comp'].iloc[0]
            })

    print("Writing JSON files...")
    with open(os.path.join(OUT_DIR, 'medicine_master.json'), 'w') as f:
        json.dump(canonical_meds, f, indent=2)
    with open(os.path.join(OUT_DIR, 'product_enrichment.json'), 'w') as f:
        json.dump(product_enrichment, f, indent=2)
    with open(os.path.join(OUT_DIR, 'medicine_master_quality_report.json'), 'w') as f:
        json.dump(qa_report, f, indent=2)
    with open(os.path.join(OUT_DIR, 'medicine_resolution_review.json'), 'w') as f:
        json.dump(resolution_review, f, indent=2)
    print(f"Done in {time.time() - t0:.2f} seconds! Total Canonical Medicines: {len(canonical_meds)}")

if __name__ == "__main__":
    build_master()
