import numpy as np
from PIL import Image
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='en')
img = Image.open('/Users/deepaks/.gemini/antigravity/brain/22f80a11-3908-4a5e-afe2-8df4134f6a31/.user_uploaded/media_1787111051039.png').convert('RGB')
res = ocr.ocr(np.array(img))
print("Raw results:", res)
