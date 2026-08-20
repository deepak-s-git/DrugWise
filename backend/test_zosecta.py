import numpy as np
from PIL import Image
from paddleocr import PaddleOCR
import warnings
warnings.filterwarnings("ignore")

ocr = PaddleOCR(use_textline_orientation=True, lang='en')
img = Image.open('/Users/deepaks/.gemini/antigravity/brain/22f80a11-3908-4a5e-afe2-8df4134f6a31/.user_uploaded/media_1787111854401.png').convert('RGB')
results = ocr.predict(np.array(img))

if results and isinstance(results[0], dict) and 'rec_texts' in results[0]:
    texts = results[0]['rec_texts']
    polys = results[0]['dt_polys']
    text_with_size = []
    for poly, text in zip(polys, texts):
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        w = max(xs) - min(xs)
        h = max(ys) - min(ys)
        font_size = min(w, h)
        text_with_size.append((font_size, text))
    
    text_with_size.sort(key=lambda x: x[0], reverse=True)
    print("Sorted by font size:")
    for size, t in text_with_size:
        print(f"Size: {size}px -> {t}")
