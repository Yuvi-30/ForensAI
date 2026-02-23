import io
import numpy as np
from PIL import Image, ImageEnhance

def run_ela(image: Image.Image, quality: int = 90, amplify: int = 10) -> Image.Image:
    buffer = io.BytesIO()
    image.convert("RGB").save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")

    orig_arr = np.array(image.convert("RGB"), dtype=np.float32)
    recomp_arr = np.array(recompressed, dtype=np.float32)

    diff = np.abs(orig_arr - recomp_arr) * amplify
    diff = np.clip(diff, 0, 255).astype(np.uint8)

    ela_image = Image.fromarray(diff)

    ela_image = ImageEnhance.Contrast(ela_image).enhance(2.0)
    return ela_image
