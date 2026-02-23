import io
from PIL import Image
from ml.ela import run_ela
from ml.detector import predict, get_model_and_processor
from ml.gradcam import generate_gradcam
from core.storage import upload_bytes, generate_key


def pil_to_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def run_pipeline(image: Image.Image, job_id: str) -> dict:
    # 1. ELA
    ela_img = run_ela(image)
    ela_key = generate_key(f"jobs/{job_id}/ela")
    ela_url = upload_bytes(pil_to_bytes(ela_img), ela_key)

    # 2. ViT inference
    result = predict(image)
    verdict = result["verdict"]
    confidence = result["confidence"]
    target_class = 0 if verdict == "AI_GENERATED" else 1

    # 3. Grad-CAM
    model, processor = get_model_and_processor()
    gradcam_img = generate_gradcam(image, model, processor, target_class=target_class)
    gradcam_key = generate_key(f"jobs/{job_id}/gradcam")
    gradcam_url = upload_bytes(pil_to_bytes(gradcam_img), gradcam_key)

    return {
        "verdict": verdict,
        "confidence": confidence,
        "ela_url": ela_url,
        "gradcam_url": gradcam_url,
        "fake_prob": result["fake_prob"],
        "real_prob": result["real_prob"],
    }
