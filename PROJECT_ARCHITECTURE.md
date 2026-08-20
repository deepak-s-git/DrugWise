# Project Architecture & Phase 0 Inspection

This document outlines the existing state of the medical data pipeline and defines the architectural blueprint for the open-source Indian Medicine Information Platform, fulfilling Phase 0 of the project development plan.

## 1. What Already Exists (The Data Layer)

The underlying canonical database has already been generated via the `build_master_dataset.py` script. The raw data (`D1`, `D3`, `D4`) was aggressively normalized, internally deduplicated, and unified using deterministic SHA-256 hashing. Dataset `D2` was quarantined due to being synthetic.

### Existing Relational CSV Outputs
Currently stored in `/Users/deepaks/Desktop/MED/`:

1.  **`medicine_entities.csv` (~12K rows)**
    *   **Description:** The scientific layer representing abstract active ingredients.
    *   **Schema:** `medicine_id` (PK, string hash), `norm_comp` (string), `category` (string), `indication` (string), `side_effects` (string), `drug_interactions` (string).
2.  **`product_records.csv` (~252K rows)**
    *   **Description:** The brand/SKU layer representing manufactured products.
    *   **Schema:** `product_id` (PK, string hash), `medicine_id` (FK), `norm_name` (string), `original_name` (string array/delimited), `manufacturer` (string), `strength` (string), `dosage_form` (string), `pack_size` (string), `is_discontinued` (boolean).
3.  **`product_prices.csv` (~260K rows)**
    *   **Description:** An append-only pricing ledger preserving all observations.
    *   **Schema:** `price_id` (PK), `product_id` (FK), `price_inr` (float), `price_source` (string), `pack_size_context` (string).
4.  **`provenance.csv` (~1.1M rows)**
    *   **Description:** Traceability ledger mapping entity fields to exact raw file row IDs.
    *   **Schema:** `entity_id` (FK to Medicine or Product), `field_name` (string), `source_dataset` (string), `source_row_id` (integer), `original_value` (string).

### Existing Normalization Logic
*   **Names:** Lowercased, stripped, dosage forms standardized (e.g., `tabs` -> `tablet`).
*   **Compositions:** Lowercased, delimiters standardized to `+`, and ingredients sorted alphabetically to unify combinations (e.g., `A + B` matches `B + A`).
*   **IDs:** Completely deterministic (e.g., `MED_<hash(composition)>`). No random UUIDs.

---

## 2. What the Application Needs (The Platform Blueprint)

To safely and performantly expose this dataset to users while strictly separating database facts from medical advice, the following architecture will be implemented across subsequent phases.

### A. Database Layer (Phase 1)
*   **Technology:** **SQLite** (for easy local setup, zero-configuration, and portability) combined with **FTS5 (Full-Text Search)** extension for hyper-fast text matching. The schema will remain strictly ANSI SQL to allow seamless migration to **PostgreSQL** in the future.
*   **Indexes Required:**
    *   `product_records(norm_name, manufacturer, dosage_form)`
    *   `medicine_entities(norm_comp)`
    *   Foreign Key indexes (`medicine_id`, `product_id`)

### B. API & Backend Layer (Phases 2, 3, 7, 10, 13)
*   **Technology:** **Python + FastAPI**. FastAPI provides extreme performance, built-in rate-limiting/security capabilities, and automatic interactive API documentation (Swagger/OpenAPI for Phase 10).
*   **Search Engine Logic:** The search endpoint (`/api/search`) will utilize SQLite FTS5. Results will be strictly ranked mathematically (Exact Brand > Exact Generic > Prefix > Token > Fuzzy). *Fuzzy search will only be used to retrieve potential matches for typos, never to alter or merge the underlying canonical data.*
*   **OCR Integration:** Python libraries like `EasyOCR` or `pytesseract`, combined with OpenCV for image preprocessing, will be deployed for the blister scanning feature.

### C. Frontend Web Application (Phases 4, 5, 9)
*   **Technology:** Pure **HTML/JavaScript** or a minimal **Vite + React** setup. 
*   **Aesthetics:** We will adhere to a functional, highly-polished vanilla CSS design system prioritizing clarity, premium typography, and mobile responsiveness. TailwindCSS will be avoided as per core directives.
*   **Safety Disclaimer:** A strict, non-dismissible safety banner will be present across all Medicine Details and OCR pages indicating the tool is for educational use only and does not provide medical advice.

### D. Quality & Testing (Phases 6, 8, 12)
*   **Technology:** `pytest`.
*   **Search Eval:** A dedicated Python test suite will validate exact-hit and top-5 accuracy for common, misspelled, and highly similar drugs (e.g., `Augmentin 625` vs `Augmentin 375`) before the UI is built.
*   **OCR Eval:** A test dataset of blister pack images will be collected and tested against the OCR pipeline to guarantee false identifications are rejected.

---

**Phase 0 Inspection Complete.** We have a clear understanding of the generated datasets, schemas, and normalization logic. The relational architecture is sound and fully prepared to be migrated into an SQL database. Awaiting approval to proceed to Phase 1 (Database Layer Construction).
