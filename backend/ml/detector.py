from PIL import Image
from transformers import pipeline

_pipe = None

def _load_model():
    global _pipe
    if _pipe is None:
        _pipe = pipeline(
            "image-classification",
            model="Organika/sdxl-detector",
            model_kwargs={"cache_dir": "/app/model_cache"}
        )
    return _pipe

def predict(image: Image.Image) -> dict:
    pipe = _load_model()
    results = pipe(image.convert("RGB"))
    scores = {r['label'].lower(): r['score'] for r in results}

    fake_prob = scores.get('artificial', scores.get('sdxl', scores.get('fake', 0.0)))
    real_prob = scores.get('real', scores.get('nature', 1.0 - fake_prob))

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
    pipe = _load_model()
    return pipe.model, pipe.feature_extractor