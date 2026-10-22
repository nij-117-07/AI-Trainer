import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.poet_engine.dependencies import get_poet_service
from linguistic.poet_engine.schemas import ConceptRequest, ConceptResponse
from linguistic.poet_engine.services import GenerationError, PoetService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/poet_engine", tags=["Poetic Philology"])


class PoetHTTPError(HTTPException):
    """Base HTTP exception for the poet_engine module."""


class PoetProcessingError(PoetHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        PoetProcessingError: Always.
    """
    logger.error("Poet engine failed to explain the concept: %s", exc)
    raise PoetProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to explain the concept.",
    )


@router.post("/explain", response_model=ConceptResponse, status_code=status.HTTP_200_OK)
async def explain_concept(
    request: ConceptRequest,
    service: PoetService = Depends(get_poet_service),
    _: str = Depends(verify_api_key),
) -> ConceptResponse:
    """
    Explains the 'Soul' of a word using AI-driven poetic philology.

    Args:
        request (ConceptRequest): The validated request schema.
        service (PoetService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        ConceptResponse: The poetic breakdown of the concept.

    Raises:
        PoetProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate_explanation(request)
    except GenerationError as exc:
        _raise_processing_error(exc)
