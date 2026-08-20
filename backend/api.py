from fastapi import FastAPI, Query, HTTPException, Path, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import re
import json
import contextlib
from symspellpy import SymSpell
import ocr_scanner

import os
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'medicine.db')

# Initialize SymSpell globally
sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading SymSpell dictionary from database...")
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # We only need to check if table exists first (in case it's not built yet)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='medicine_search_fts'")
        if cursor.fetchone():
            cursor.execute("SELECT DISTINCT canonical_name FROM medicine_search_fts WHERE canonical_name IS NOT NULL")
            for row in cursor:
                val = row[0].lower()
                sym_spell.create_dictionary_entry(val, 1)
                for token in re.sub(r'[^\w\s]', ' ', val).split():
                    if len(token) > 2:
                        sym_spell.create_dictionary_entry(token, 1)
                        
            cursor.execute("SELECT DISTINCT composition_normalized FROM medicine_search_fts WHERE composition_normalized IS NOT NULL")
            for row in cursor:
                val = row[0].lower()
                sym_spell.create_dictionary_entry(val, 1)
                for token in re.sub(r'[^\w\s]', ' ', val).split():
                    if len(token) > 2:
                        sym_spell.create_dictionary_entry(token, 1)
    except Exception as e:
        print("SymSpell loading error (expected if DB not built):", e)
    finally:
        conn.close()
    print("SymSpell dictionary loaded successfully.")
    yield

app = FastAPI(title="Medicine Search API (Canonical)", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def normalize_query(q: str) -> str:
    q = q.lower().strip()
    q = re.sub(r'[^\w\s]', ' ', q)
    # Normalize "10 mg" -> "10mg" to match FTS tokens correctly
    q = re.sub(r'(\d+)\s+(mg|mcg|ml|g|gm)\b', r'\1\2', q)
    q = re.sub(r'\s+', ' ', q)
    return q.strip()

def _execute_search(norm_q: str, limit: int, offset: int, conn: sqlite3.Connection):
    if not norm_q:
        return 0, []
        
    tokens = norm_q.split()
    match_query = " OR ".join([f'"{token}"*' for token in tokens])
    
    sql = """
    SELECT 
        m.medicine_id, 
        m.canonical_name,
        m.composition_normalized,
        m.raw_json,
        bm25(medicine_search_fts, 10.0, 5.0, 1.0) AS rank_score,
        ? LIKE '%' || REPLACE(LOWER(fts.canonical_name), ' + ', ' ') || '%' AS contained_in_query
    FROM medicine_search_fts fts
    JOIN medicine_master m ON fts.medicine_id = m.medicine_id
    WHERE medicine_search_fts MATCH ?
    ORDER BY 
        contained_in_query DESC,
        CASE WHEN (? LIKE '%' || REPLACE(LOWER(fts.canonical_name), ' + ', ' ') || '%') THEN LENGTH(m.canonical_name) ELSE 0 END DESC,
        rank_score ASC
    LIMIT ? OFFSET ?;
    """
    count_sql = "SELECT COUNT(DISTINCT medicine_id) FROM medicine_search_fts WHERE medicine_search_fts MATCH ?"
    
    cursor = conn.cursor()
    cursor.execute(count_sql, (match_query,))
    total = cursor.fetchone()[0]
    
    cursor.execute(sql, (norm_q, match_query, norm_q, limit, offset))
    rows = cursor.fetchall()
    return total, rows

@app.get("/api/search")
def search_medicine(q: str = Query(..., min_length=2), page: int = 1, limit: int = 20):
    norm_q = normalize_query(q)
    if not norm_q:
        return {"results": [], "total": 0, "page": page, "limit": limit}
    
    offset = (page - 1) * limit
    corrected_query = None
    
    conn = get_db_connection()
    try:
        total, rows = _execute_search(norm_q, limit, offset, conn)
        
        if total == 0:
            suggestions = sym_spell.lookup_compound(norm_q, max_edit_distance=2)
            if suggestions:
                best_suggestion = suggestions[0].term
                if best_suggestion != norm_q:
                    corrected_query = best_suggestion
                    total, rows = _execute_search(corrected_query, limit, offset, conn)
        
        results = []
        for row in rows:
            med_data = json.loads(row["raw_json"])
            results.append({
                "medicine_id": row["medicine_id"],
                "product_name": row["canonical_name"], # mapped for frontend compat
                "canonical_name": row["canonical_name"],
                "composition": row["composition_normalized"],
                "formulations": med_data.get("formulations", []),
                "relevance_score": round(row["rank_score"], 4)
            })
            
        response_data = {
            "results": results, 
            "total": total, 
            "page": page, 
            "limit": limit
        }
        if corrected_query:
            response_data["corrected_query"] = corrected_query
            
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/medicine/{medicine_id}")
def get_medicine_details(medicine_id: str = Path(...)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT raw_json FROM medicine_master WHERE medicine_id = ?", (medicine_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Medicine not found")
        
        medicine = json.loads(row["raw_json"])
        
        # Load products enriched data
        cursor.execute("SELECT * FROM product_enrichment WHERE medicine_id = ?", (medicine_id,))
        products = [dict(r) for r in cursor.fetchall()]
        
        # For frontend compatibility, we mock the old shapes
        return {
            "medicine": medicine, # New rich shape
            "products": products,
            # Shim for old frontend
            "linked_products_count": len(products),
            "manufacturers": list(set([p["manufacturer"] for p in products if p["manufacturer"]])),
            "available_strengths": list(set([f["strength"] for f in medicine.get("formulations", []) if f.get("strength")])),
            "available_dosage_forms": list(set([f["dosage_form"] for f in medicine.get("formulations", []) if f.get("dosage_form")])),
            "provenance": medicine.get("source_datasets", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/scan")
async def scan_medicine_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        raw_text = ocr_scanner.process_image(contents)
        query = ocr_scanner.get_searchable_query(raw_text)
        
        if not query:
            return {"success": False, "message": "Could not identify any medicine names from the image.", "raw_text": raw_text}
            
        search_results = search_medicine(q=query, limit=5)
        
        if search_results.get("total", 0) > 0:
            return {
                "success": True, 
                "query_used": query,
                "raw_text": raw_text,
                "top_match": search_results["results"][0],
                "all_results": search_results["results"]
            }
        else:
            return {
                "success": False,
                "message": f"Extracted text '{query}', but found no matches.",
                "raw_text": raw_text
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
def get_database_stats():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM medicine_master")
        total_medicines = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM product_enrichment")
        total_products = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM medicine_formulations")
        total_formulations = cursor.fetchone()[0]
        
        return {
            "volumes": {
                "canonical_medicines": total_medicines,
                "formulations": total_formulations,
                "products": total_products
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
