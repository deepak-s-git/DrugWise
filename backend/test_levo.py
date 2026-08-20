import numpy as np
from PIL import Image
from paddleocr import PaddleOCR
import warnings
warnings.filterwarnings("ignore")

ocr = PaddleOCR(use_textline_orientation=True, lang='en')
img = Image.open('/Users/deepaks/.gemini/antigravity/brain/22f80a11-3908-4a5e-afe2-8df4134f6a31/.user_uploaded/media_1787111854430.png').convert('RGB')
results = ocr.predict(np.array(img))

if results and isinstance(results[0], dict) and 'rec_texts' in results[0]:
    texts = results[0]['rec_texts']
    polys = results[0]['dt_polys']
    text_info = []
    for poly, text in zip(polys, texts):
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        w = max(xs) - min(xs)
        h = max(ys) - min(ys)
        font_size = min(w, h)
        center_y = (max(ys) + min(ys)) / 2
        text_info.append((font_size, center_y, text))
    
    # Sort by font size descending, then by center_y ascending (top to bottom)
    text_info.sort(key=lambda x: (-x[0], x[1]))
    print("Sorted by font size desc, then Y asc:")
    for size, cy, t in text_info:
        print(f"Size: {size}px, Y:{cy:.1f} -> {t}")
