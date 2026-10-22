import os
import whisper
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Whisper OpenAI-Compatible API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model globally so it stays in memory
# Change "base" to "small", "medium", or "large-v3" based on your hardware
model = whisper.load_model("base")

@app.post("/v1/audio/transcriptions")
async def transcribe_audio(
    file: UploadFile = File(...),
    model_name: str = Form("whisper-1"),  # Ignored but kept for compatibility
    language: str = Form(None),
    prompt: str = Form(None),
    response_format: str = Form("json"),
    temperature: float = Form(0.0)
):
    # 1. Save temporary file
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 2. Run inference
        # We pass initial_prompt and language to match OpenAI's capability
        result = model.transcribe(
            temp_file, 
            initial_prompt=prompt, 
            language=language, 
            temperature=temperature
        )

        # 3. Format response to match OpenAI's structure
        if response_format == "text":
            return result["text"]
        
        return {"text": result["text"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # 4. Clean up the temp file
        if os.path.exists(temp_file):
            os.remove(temp_file)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)