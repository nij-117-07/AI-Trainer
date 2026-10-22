import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.idioms.dependencies import get_idiom_service
from linguistic.idioms.schemas import IdiomRequest, IdiomResponse
from linguistic.idioms.services import GenerationError, IdiomService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/idioms", tags=["Idioms"])


class IdiomHTTPError(HTTPException):
    """Base HTTP exception for the idioms module."""


class IdiomProcessingError(IdiomHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        IdiomProcessingError: Always.
    """
    logger.error("Idiom engine failed to generate the lesson: %s", exc)
    raise IdiomProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the idiom lesson.",
    )


@router.post("/generate", response_model=IdiomResponse, status_code=status.HTTP_200_OK)
async def create_idiom_lesson(
    payload: IdiomRequest,
    service: IdiomService = Depends(get_idiom_service),
    _: str = Depends(verify_api_key),
) -> IdiomResponse:
    """
    Generates an idiomatic expression lesson based on linguistic parameters.

    Args:
        payload (IdiomRequest): The validated request schema.
        service (IdiomService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        IdiomResponse: The generated idiom lesson.

    Raises:
        IdiomProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate_idiom_lesson(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
