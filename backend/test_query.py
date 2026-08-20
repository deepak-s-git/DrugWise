import sqlite3

conn = sqlite3.connect('/Users/deepaks/Desktop/MED/medicine.db')
cursor = conn.cursor()

norm_q = "pantoprazole"
tokens = norm_q.split()
match_query = " AND ".join([f'"{token}"*' for token in tokens])

sql = """
    SELECT 
        m.medicine_id, 
        m.canonical_name,
        m.composition_normalized,
        m.raw_json,
        MIN(fts.rank) AS rank_score,
        MAX(LOWER(fts.canonical_name) = ?) AS exact_name,
        MAX(? LIKE LOWER(fts.canonical_name) || '%') AS starts_with_name
    FROM medicine_search_fts fts
    JOIN medicine_master m ON fts.medicine_id = m.medicine_id
    WHERE medicine_search_fts MATCH ?
    GROUP BY m.medicine_id
    ORDER BY 
        exact_name DESC,
        starts_with_name DESC,
        m.is_combination ASC,
        rank_score ASC
    LIMIT 12 OFFSET 0;
"""

try:
    cursor.execute(sql, (norm_q, norm_q, match_query))
    rows = cursor.fetchall()
    print(f"Success! {len(rows)} distinct medicines found.")
    for r in rows:
        print(r[1])
except Exception as e:
    print(f"Error: {e}")

