from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Union
from sentence_transformers import SentenceTransformer
import torch
import gc

app = FastAPI()

model_name = "nomic-ai/nomic-embed-text-v1.5"
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading model on: {device}")

# 1. Properly load Nomic with remote code support & appropriate precision
model_kwargs = {"torch_dtype": torch.float16 if device == "cuda" else torch.float32}

model = SentenceTransformer(
    model_name, 
    device=device, 
    trust_remote_code=True,
    model_kwargs=model_kwargs
)

class EmbeddingRequest(BaseModel):
    input: Union[str, List[str]]
    model: str

@app.post("/v1/embeddings")
async def get_embeddings(request: EmbeddingRequest):
    # Standardize input to a list
    texts = [request.input] if isinstance(request.input, str) else request.input
    
    # 2. Nomic requirement: Prefix text appropriately if not already done
    # (Defaulting to 'search_document: ' here, adjust as needed)
    processed_texts = [
        t if t.startswith(("search_query:", "search_document:")) else f"search_document: {t}"
        for t in texts
    ]
    
    # 3. Calculate approximate token count using the underlying tokenizer
    total_tokens = 0
    try:
        tokenizer = model.tokenizer
        tokens = tokenizer(processed_texts, padding=False, truncation=False)
        total_tokens = sum(len(t) for t in tokens["input_ids"])
    except Exception:
        pass # Fallback if tokenizer counting fails
    
    # 4. Generate embeddings with optimized batch sizing
    # convert_to_numpy=True + .tolist() prevents PyTorch CUDA tensor leakage
    embeddings = model.encode(
        processed_texts, 
        batch_size=32, 
        convert_to_numpy=True,
        show_progress_bar=False
    ).tolist()
    
    # 5. Force clear PyTorch cache to stop memory bloat (especially on GPU)
    if device == "cuda":
        torch.cuda.empty_cache()
    
    # Construct OpenAI-compatible response
    data = []
    for i, emb in enumerate(embeddings):
        data.append({
            "object": "embedding",
            "embedding": emb,
            "index": i
        })
        
    return {
        "object": "list",
        "data": data,
        "model": request.model,
        "usage": {
            "prompt_tokens": total_tokens,
            "total_tokens": total_tokens
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Limit workers to 1 to prevent multiple processes from cloning the 6GB memory space
    uvicorn.run(app, host="0.0.0.0", port=18074, workers=2)

# f

# from fastapi import FastAPI
# from pydantic import BaseModel
# from typing import List, Union
# from sentence_transformers import SentenceTransformer
# import torch

# app = FastAPI()

# # 1. Update the model name to BGE-M3
# model_name = "BAAI/bge-m3"

# device = "cuda" if torch.cuda.is_available() else "cpu"
# print(f"Loading model '{model_name}' on: {device}")

# # Load model onto the detected device
# model = SentenceTransformer(model_name, device=device)

# class EmbeddingRequest(BaseModel):
#     input: Union[str, List[str]]
#     model: str

# @app.post("/v1/embeddings")
# async def get_embeddings(request: EmbeddingRequest):
#     # Standardize input to a list
#     texts = [request.input] if isinstance(request.input, str) else request.input
    
#     # Generate embeddings 
#     # (bge-m3 automatically outputs the dense 1024-dimensional embeddings here)
#     embeddings = model.encode(texts).tolist()
    
#     # Construct OpenAI-compatible response
#     data = []
#     for i, emb in enumerate(embeddings):
#         data.append({
#             "object": "embedding",
#             "embedding": emb,
#             "index": i
#         })
        
#     return {
#         "object": "list",
#         "data": data,
#         "model": request.model,
#         "usage": {
#             "prompt_tokens": 0, # Note: Actual token counting requires a tokenizer
#             "total_tokens": 0
#         }
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=18074)