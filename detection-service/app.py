import os
import io
import torch
import requests
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection

# Initialize FastAPI app
app = FastAPI(
    title="OWL-ViT Object Detection API",
    description="Microservice to detect ingredients in images using Google's OWL-ViT model.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load model and processor on startup
MODEL_NAME = "google/owlvit-base-patch32"
print(f"Loading processor and model '{MODEL_NAME}'...")
try:
    processor = AutoProcessor.from_pretrained(MODEL_NAME)
    model = AutoModelForZeroShotObjectDetection.from_pretrained(MODEL_NAME).to(device)
    model.eval()
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    raise e

# Pydantic schemas
class DetectionRequest(BaseModel):
    image_url: str = Field(..., description="Public URL of the image to analyze.")
    candidate_labels: List[str] = Field(
        ..., 
        description="List of English candidate labels to look for.",
        example=["egg", "tomato", "garlic", "onion"]
    )
    threshold: Optional[float] = Field(
        0.1, 
        description="Confidence threshold to filter detections.",
        ge=0.0, 
        le=1.0
    )

class DetectionResult(BaseModel):
    label: str
    confidence: float
    box: List[float]  # [ymin, xmin, ymax, xmax]

class DetectionResponse(BaseModel):
    success: bool
    detected_labels: List[str]
    detections: List[DetectionResult]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "model": MODEL_NAME,
        "device": str(device)
    }

@app.post("/detect", response_model=DetectionResponse)
async def detect_objects(payload: DetectionRequest):
    try:
        # 1. Download the image
        response = requests.get(payload.image_url, timeout=15)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to fetch or open image from URL: {str(e)}"
        )

    try:
        # 2. Prepare inputs for OWL-ViT
        # OWL-ViT expects candidate_labels inside nested lists: [[ "label1", "label2" ]]
        texts = [payload.candidate_labels]
        
        inputs = processor(text=texts, images=image, return_tensors="pt").to(device)
        
        # 3. Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
        
        # 4. Post-process detection results
        # Target sizes is needed to scale boxes back to absolute pixels
        target_sizes = torch.Tensor([image.size[::-1]]).to(device)
        results = processor.post_process_object_detection(
            outputs=outputs, 
            threshold=payload.threshold, 
            target_sizes=target_sizes
        )
        
        # Extract first batch results
        batch_results = results[0]
        scores = batch_results["scores"].cpu().tolist()
        labels = batch_results["labels"].cpu().tolist()
        boxes = batch_results["boxes"].cpu().tolist()
        
        detections = []
        detected_set = set()
        
        for score, label_idx, box in zip(scores, labels, boxes):
            label = payload.candidate_labels[label_idx]
            detections.append(
                DetectionResult(
                    label=label,
                    confidence=round(score, 4),
                    box=[round(coord, 2) for coord in box]  # [ymin, xmin, ymax, xmax]
                )
            )
            detected_set.add(label)
            
        return DetectionResponse(
            success=True,
            detected_labels=list(detected_set),
            detections=detections
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Inference failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    # Hugging Face Spaces port is typically 7860
    uvicorn.run(app, host="0.0.0.0", port=7860)
