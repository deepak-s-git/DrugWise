<div align="center">
  <img src="public/pill.svg" alt="DrugWise Logo" width="120" height="120">
  <h1>DrugWise</h1>
  <p><strong>The Open-Source Medical Intelligence Platform</strong></p>
  <p>A deterministic, hallucination-free search engine and clinical protocol chatbot built on top of a massive, heavily normalized dataset of generic and branded medicines.</p>
</div>

---

## 🔬 What is DrugWise?

DrugWise is a next-generation medical platform designed to give users unprecedented access to clinical drug data. Rather than relying on LLMs that can hallucinate medical advice, DrugWise operates deterministically on a rigorously normalized SQL database of over **250,000+** product SKUs and their underlying abstract active ingredients.

It features:
- ⚡️ **Hyper-fast FTS5 Search**: An instantaneous, typo-tolerant search engine mapping commercial brands (e.g., "Augmentin") to their abstract generics (e.g., "Amoxicillin + Clavulanic Acid").
- 🤖 **Clinical Protocol Chatbot**: A deterministic decision-tree medical assistant that guides users through symptoms (e.g., Fever, Migraine) to exact clinical recommendations, fetching live UI medicine cards from the database.
- 📸 **Blister Pack Scanning**: (Backend OCR Pipeline built-in) allowing users to identify physical medicine strips using computer vision.
- ⚖️ **Clinical Comparisons**: Side-by-side mapping of drug interactions, side effects, and pricing across different manufacturers.

## 🏗 System Architecture

DrugWise is structured as a modern Full-Stack Monorepo, cleanly decoupling a high-performance Python backend from a beautiful Next.js frontend.

### 1. The Frontend (`/app`, `/components`)
- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS V4 + Custom Clinical Premium Theme (Emerald Green / Jet Black)
- **Animations:** Framer Motion (Biological Scaling algorithms) + Custom WebGL Shaders
- **UI Architecture:** 
  - Dynamic route matching for medicine IDs (`/medicine/[id]`)
  - Floating Action Button (FAB) clinical chatbot globally mounted
  - Custom React components built from scratch (Carousel, Spotlight Cards, Hover Result Grids)

### 2. The Backend (`/backend`)
- **Framework:** Python + FastAPI
- **Database:** SQLite with `FTS5` (Full-Text Search) enabled for ultra-fast text indexing.
- **Search Engine:** Custom `SymSpell` integration (max edit distance = 2) for typo-correction before hitting the deterministic SQL queries.
- **Pipeline:** Raw data ingestion scripts (`scrape_*.py`, `build_master_dataset.py`) are archived alongside the backend logic to reconstruct the `.db` file at any time.

### 3. The Data Structure (`medicine.db`)
The underlying dataset was aggressively normalized using SHA-256 hashing.
- `medicine_entities` (~12K rows): The scientific layer (abstract active ingredients, side effects, interactions).
- `product_records` (~252K rows): The brand/SKU layer (manufacturer, strength, pack size).
- `product_prices` (~260K rows): Append-only pricing ledger.
- `provenance` (~1.1M rows): Traceability ledger mapping every field to its exact raw data source.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- npm or pnpm

### 1. Start the API (Backend)
```bash
cd backend
# Install Python dependencies (FastAPI, Uvicorn, SymSpell, etc.)
pip install fastapi uvicorn symspellpy sqlite3-api
# Run the FastAPI server
uvicorn api:app --reload --port 8000
```
*Note: The backend automatically resolves the location of `medicine.db` dynamically.*

### 2. Start the Web App (Frontend)
```bash
# From the project root
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Community & Fair Use

DrugWise is a passion project built for the public good. There are no corporate trackers, no advertisements, and no strict enterprise licenses. 

**Disclaimer:** This platform is for educational and research purposes. DrugWise provides data "as-is" and is NOT a substitute for professional medical advice. Always consult a physician.

## 📝 License
Open Source. Help us expand the largest medical database in the world.
