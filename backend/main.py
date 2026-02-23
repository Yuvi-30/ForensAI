from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.upload import router as upload_router
from api.routes.results import router as results_router
from core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Cloud-Native AI Image Forensics — detects AI-generated images using ViT + Grad-CAM + ELA",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api/v1", tags=["Upload"])
app.include_router(results_router, prefix="/api/v1", tags=["Results"])

@app.on_event("startup")
async def startup():
    from ml.detector import get_model_and_processor
    get_model_and_processor()
    print("Model loaded and ready")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)