import warnings

# --- Suppress PyTorch Runtime Warnings ---
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

import io
import time
import torch
import torchaudio
import soundfile as sf
import uvicorn
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
from kokoro import KPipeline

app = FastAPI()

# --- Configuration ---
DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"

class TTSRequest(BaseModel):
    model: str = "kokoro"
    input: str
    voice: str = "af_heart"
    language: str = "a"
    response_format: str = "wav"
    speed: float = 1.0

# Initialize Pipeline
pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M", device=DEVICE)

@app.post("/v1/audio/speech")
async def text_to_speech(request: TTSRequest):
    try:
        start_total = time.time()

        if not request.input.strip():
            raise HTTPException(status_code=400, detail="Input text is empty.")

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            generator = pipeline(
                request.input, 
                voice=request.voice, 
                speed=request.speed, 
                split_pattern=r"\n+"
            )

            audio_tensors = []
            sr = 24000  # Default Kokoro sample rate

            for _, _, audio in generator:
                if audio is not None:
                    # Check type: convert from numpy if needed, or send directly to GPU if already a Tensor
                    if isinstance(audio, torch.Tensor):
                        tensor = audio.to(DEVICE).to(torch.float32)
                    else:
                        tensor = torch.from_numpy(audio).to(DEVICE).to(torch.float32)
                    
                    audio_tensors.append(tensor)

        if not audio_tensors:
            raise HTTPException(status_code=500, detail="Model produced no audio.")

        # Concatenate audio chunks
        combined_audio = torch.cat(audio_tensors, dim=-1)

        # Output encoding
        audio_np = combined_audio.squeeze().cpu().numpy()
        
        buffer = io.BytesIO()
        fmt = request.response_format.upper() if request.response_format.upper() != "MP3" else "WAV"
        sf.write(buffer, audio_np, sr, format=fmt)
        buffer.seek(0)

        print(f"DEBUG: Total Latency: {time.time() - start_total:.4f}s")

        return Response(
            content=buffer.read(),
            media_type=f"audio/{request.response_format.lower()}"
        )

    except Exception as e:
        import traceback
        print(f"ERROR: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8010, reload=False)