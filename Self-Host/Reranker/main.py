# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel, Field
# from typing import List, Optional, Union
# from sentence_transformers import CrossEncoder
# import uvicorn

# app = FastAPI(title="OpenAI-Compatible Reranker API")

# # Load a high-quality reranker model
# # 'BAAI/bge-reranker-base' is a great balance of speed and accuracy
# model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2"
# model = CrossEncoder(model_name, max_length=512)

# # --- Schema Definitions ---

# class RerankRequest(BaseModel):
#     model: str = Field(default=model_name)
#     query: str
#     documents: List[str]
#     top_n: Optional[int] = None
#     return_documents: bool = False

# class RerankResult(BaseModel):
#     index: int
#     relevance_score: float
#     document: Optional[str] = None

# class RerankResponse(BaseModel):
#     object: str = "list"
#     results: List[RerankResult]
#     model: str
#     usage: dict = {"prompt_tokens": 0, "total_tokens": 0}

# # --- API Endpoints ---

# @app.post("/v1/rerank", response_model=RerankResponse)
# @app.post("/rerank", response_model=RerankResponse)
# async def rerank(request: RerankRequest):
#     if not request.documents:
#         return RerankResponse(results=[], model=request.model)

#     # Prepare pairs for the CrossEncoder: [(query, doc1), (query, doc2), ...]
#     sentence_pairs = [[request.query, doc] for doc in request.documents]
    
#     # Compute relevance scores
#     scores = model.predict(sentence_pairs)
    
#     # Create results list with original indices
#     results = []
#     for i, score in enumerate(scores):
#         results.append({
#             "index": i,
#             "relevance_score": float(score),
#             "document": request.documents[i] if request.return_documents else None
#         })

#     # Sort by score descending
#     results.sort(key=lambda x: x["relevance_score"], reverse=True)

#     # Apply top_n limit if requested
#     if request.top_n is not None:
#         results = results[:request.top_n]

#     return {
#         "object": "list",
#         "results": results,
#         "model": request.model,
#         "usage": {"prompt_tokens": 0, "total_tokens": 0} # Usage is optional
#     }

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from sentence_transformers import CrossEncoder
import uvicorn

app = FastAPI(title="OpenAI-Compatible Reranker API")

# Load the high-quality BGE Reranker v2 M3 model
# Setting max_length to 4096 to handle longer documents
model_name = "Alibaba-NLP/gte-reranker-modernbert-base"
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CrossEncoder(
    "Alibaba-NLP/gte-reranker-modernbert-base",
    max_length=4096,
    device=device,
    # Convert model to FP16 to halve VRAM usage
    model_kwargs={"torch_dtype": torch.float16} if device == "cuda" else {}
)

# --- Schema Definitions ---

class RerankRequest(BaseModel):
    model: str = Field(default=model_name)
    query: str
    documents: List[str]
    top_n: Optional[int] = None
    return_documents: bool = False

class RerankResult(BaseModel):
    index: int
    relevance_score: float
    document: Optional[str] = None

class RerankResponse(BaseModel):
    object: str = "list"
    results: List[RerankResult]
    model: str
    usage: dict = {"prompt_tokens": 0, "total_tokens": 0}

# --- API Endpoints ---

@app.post("/v1/rerank", response_model=RerankResponse)
@app.post("/rerank", response_model=RerankResponse)
async def rerank(request: RerankRequest):
    if not request.documents:
        return RerankResponse(results=[], model=request.model)

    # Prepare pairs for the CrossEncoder: [(query, doc1), (query, doc2), ...]
    sentence_pairs = [[request.query, doc] for doc in request.documents]
    
    # Compute relevance scores using BGE Reranker
    scores = model.predict(
        sentence_pairs, 
        batch_size=4, # Controls maximum GPU memory consumption per pass
        show_progress_bar=False
    )
    
    # Create results list with original indices
    results = []
    for i, score in enumerate(scores):
        results.append({
            "index": i,
            "relevance_score": float(score),
            "document": request.documents[i] if request.return_documents else None
        })

    # Sort by score descending (highest relevance first)
    results.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Apply top_n limit if requested
    if request.top_n is not None:
        results = results[:request.top_n]

    return {
        "object": "list",
        "results": results,
        "model": request.model,
        "usage": {"prompt_tokens": 0, "total_tokens": 0}
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=18073,workers=1)