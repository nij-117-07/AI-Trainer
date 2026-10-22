import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.rewriter.dependencies import get_rewriter_service
from linguistic.rewriter.schemas import RewriteRequest, RewriteResponse
from linguistic.rewriter.services import GenerationError, RewriterService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rewriter", tags=["Content Tools"])


class RewriterHTTPError(HTTPException):
    """Base HTTP exception for the rewriter module."""


class RewriterProcessingError(RewriterHTTPError):
    """Raised when the rewrite pipeline fails to produce content."""


def _raise_processing_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        RewriterProcessingError: Always.
    """
    logger.error("Rewriter failed to process request: %s", exc)
    raise RewriterProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to rewrite the text.",
    )


@router.post("/process", response_model=RewriteResponse, status_code=status.HTTP_200_OK)
async def rewrite_text(
    payload: RewriteRequest,
    service: RewriterService = Depends(get_rewriter_service),
    _: str = Depends(verify_api_key),
) -> RewriteResponse:
    """
    Rewrites text using the DSPy rewrite pipeline.

    Args:
        payload (RewriteRequest): The validated request schema.
        service (RewriterService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        RewriteResponse: The rewritten text and its metadata.

    Raises:
        RewriterProcessingError: If the rewrite pipeline fails.
    """
    try:
        return service.process_rewrite(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
