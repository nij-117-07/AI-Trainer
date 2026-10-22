import logging
import time
from fastapi import FastAPI, Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from core.config import settings
from assessment.router import assessment_router
from learning.router import learning_router
from linguistic.router import linguistic_router
from practice.router import practice_router
from tools.router import tools_router

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(name)-25s | %(levelname)-5s | %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    debug=settings.DEBUG,
)


class APITraceMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs the request body, response body and duration of each
    HTTP call when settings.API_TRACE_ENABLED is True.
    """

    async def dispatch(self, request: Request, call_next):
        if not settings.API_TRACE_ENABLED:
            return await call_next(request)

        start = time.perf_counter()
        request_body = (await request.body()).decode("utf-8", errors="replace")
        response = await call_next(request)

        response_body = b""
        async for chunk in response.body_iterator:
            response_body += chunk
        elapsed = time.perf_counter() - start

        logger.info(
            "API TRACE | %s %s | duration=%.4fs | status=%s",
            request.method,
            request.url.path,
            elapsed,
            response.status_code,
        )
        logger.info("API TRACE | request body=%s", request_body or "{}")
        logger.info("API TRACE | response body=%s", response_body.decode("utf-8", errors="replace"))

        return Response(
            content=response_body,
            status_code=response.status_code,
            media_type=response.media_type,
            headers=dict(response.headers),
        )


app.add_middleware(APITraceMiddleware)

app.include_router(practice_router)
app.include_router(learning_router)
app.include_router(linguistic_router)
app.include_router(assessment_router)
app.include_router(tools_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
