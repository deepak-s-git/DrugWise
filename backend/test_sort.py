import numpy as np
from PIL import Image
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='en')
img = Image.open('/Users/deepaks/.gemini/antigravity/brain/22f80a11-3908-4a5e-afe2-8df4134f6a31/.user_uploaded/media_1787111276627.png').convert('RGB')
results = ocr.ocr(np.array(img))

if results and isinstance(results[0], dict) and 'rec_texts' in results[0]:
    texts = results[0]['rec_texts']
    polys = results[0].get('dt_polys', [])
    if polys and len(polys) == len(texts):
        text_with_height = []
        for poly, text in zip(polys, texts):
            ys = [p[1] for p in poly]
            height = max(ys) - min(ys)
            text_with_height.append((height, text))
        
        text_with_height.sort(key=lambda x: x[0], reverse=True)
        print("Sorted by height:")
        for h, t in text_with_height:
            print(f"{h}px: {t}")
