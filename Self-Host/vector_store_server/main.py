import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from vector_store.router import router as vector_store_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("vector_store_test")

app = FastAPI(title="Vector Store Manager (Test)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vector_store_router)


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "online", "module": "vector_store"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8010, reload=True)
