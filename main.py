import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Path hack to allow importing from Sarthak's folder with a hyphen
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'llm-api'))
from lensshift_service import run_lensshift

# Load environment variables from the project root .env file
dotenv_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path)

app = FastAPI(title="LensShift Backend API")

# CRITICAL: This allows your browser extension to talk to this local server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define what the frontend will send us
class SearchRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"status": "online", "message": "LensShift Backend is running smoothly!"}

@app.post("/api/shift")
async def process_lens_shift(request: SearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    try:
        print(f"[LensShift] Analyzing query: {request.query}")
        
        # Run Sarthak's core function
        result = run_lensshift(request.query)
        return result
        
    except Exception as e:
        print(f"[Error] Pipeline failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 