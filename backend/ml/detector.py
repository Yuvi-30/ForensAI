import torch
from PIL import Image
from transformers import ViTForImageClassification, ViTImageProcessor
from core.config import settings

_model = None
_processor = None

def _load_model():
    global _model, _processor
    if _model is None:
        _processor = ViTImageProcessor.from_pretrained(
            settings.MODEL_NAME, cache_dir=settings.MODEL_CACHE_DIR
        )
        _model = ViTForImageClassification.from_pretrained(
            settings.MODEL_NAME, cache_dir=settings.MODEL_CACHE_DIR
        )
        _model.eval()
    return _model, _processor

def predict(image: Image.Image) -> dict:
    """
    Returns:
        verdict: 'AI_GENERATED' | 'REAL'
        confidence: float (0–1), probability of predicted class
        logits: raw tensor (needed for Grad-CAM)
    """
    model, processor = _load_model()
    inputs = processor(images=image.convert("RGB"), return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits  # shape: (1, 2)
    probs = torch.softmax(logits, dim=-1)[0]

    fake_prob = probs[0].item()
    real_prob = probs[1].item()

    if fake_prob > real_prob:
        verdict = "AI_GENERATED"
        confidence = fake_prob
    else:
        verdict = "REAL"
        confidence = real_prob

    return {
        "verdict": verdict,
        "confidence": round(confidence, 4),
        "fake_prob": round(fake_prob, 4),
        "real_prob": round(real_prob, 4),
    }

def get_model_and_processor():
    return _load_model()
