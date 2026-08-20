import io
import re
import numpy as np
from PIL import Image
from paddleocr import PaddleOCR
import warnings

# Suppress deprecation warnings from paddleocr
warnings.filterwarnings("ignore", category=DeprecationWarning)

print("Loading PaddleOCR models (this may take a moment)...")
# use_angle_cls is deprecated in 3.7, we use use_textline_orientation instead
ocr = PaddleOCR(use_textline_orientation=True, lang='en')
print("PaddleOCR loaded.")

def process_image(image_bytes: bytes) -> str:
    """
    Extracts text from an image byte array using PaddleOCR.
    Sorts the extracted text based on the physical height of the text bounding box.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_array = np.array(image)
        
        # Use predict instead of ocr to avoid deprecation warnings in 3.7+
        results = ocr.predict(img_array)
        
        extracted_texts = []
        if results:
            # Handle PaddleOCR v3.7+ format (list of dicts)
            if isinstance(results[0], dict) and 'rec_texts' in results[0]:
                texts = results[0]['rec_texts']
                polys = results[0].get('dt_polys', [])
                if polys and len(polys) == len(texts):
                    text_with_height = []
                    for poly, text in zip(polys, texts):
                        xs = [p[0] for p in poly]
                        ys = [p[1] for p in poly]
                        w = max(xs) - min(xs)
                        h = max(ys) - min(ys)
                        font_size = min(w, h)
                        text_with_height.append((font_size, text))
                    # Sort descending by font size (largest text first)
                    text_with_height.sort(key=lambda x: x[0], reverse=True)
                    extracted_texts = [t[1] for t in text_with_height]
                else:
                    extracted_texts = texts
            # Handle older PaddleOCR formats (list of lists)
            elif isinstance(results[0], list):
                text_with_height = []
                for line in results[0]:
                    if isinstance(line, list) and len(line) >= 2 and len(line[1]) >= 1:
                        poly = line[0]
                        text = line[1][0]
                        xs = [p[0] for p in poly]
                        ys = [p[1] for p in poly]
                        w = max(xs) - min(xs)
                        h = max(ys) - min(ys)
                        font_size = min(w, h)
                        text_with_height.append((font_size, text))
                text_with_height.sort(key=lambda x: x[0], reverse=True)
                extracted_texts = [t[1] for t in text_with_height]
                
        # Join with a delimiter so we preserve height ordering
        return " | ".join(extracted_texts)
    except Exception as e:
        print(f"PaddleOCR Error: {e}")
        return ""

def get_searchable_query(raw_text: str) -> str:
    """
    Cleans raw OCR text and extracts the most likely medicine name/tokens.
    Because raw_text is now ordered by physical text height, the first words are the largest.
    """
    if not raw_text:
        return ""
        
    lines = raw_text.split(" | ")
    valid_tokens = []
    
    for line in lines:
        text = line.lower()
        # Remove common irrelevant blister pack artifacts
        text = re.sub(r'mfg.*|exp.*|batch.*|b\.?no.*|rs\..*|₹.*|inclusive.*', ' ', text)
        # Strip symbols and leave only alphanumeric
        text = re.sub(r'[^\w\s]', ' ', text)
        
        tokens = text.split()
        for token in tokens:
            if len(token) > 3 or token.isdigit():
                valid_tokens.append(token)
                
    # Filter out common dosage forms and salt stop words that pollute the search
    stop_words = {
        'tablet', 'tablets', 'capsule', 'capsules', 'cap', 'tab', 'injection', 'inj', 
        'syrup', 'syr', 'suspension', 'drops', 'softgel', 'hydrochloride', 'hcl', 
        'sodium', 'potassium', 'maleate', 'calcium', 'mg', 'ml'
    }
    words = [t for t in valid_tokens if not t.isdigit() and t not in stop_words]
    numbers = [t for t in valid_tokens if t.isdigit()]
    
    # Grab the top 4 largest words physically, and top 1 largest number physically
    selected = words[:4]
    num_selected = numbers[:1]
    
    final_query = " ".join(selected + num_selected)
    return final_query
