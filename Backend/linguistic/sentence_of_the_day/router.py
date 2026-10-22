import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.sentence_of_the_day.dependencies import get_sentence_service
from linguistic.sentence_of_the_day.schemas import SentenceRequest, SentenceResponse
from linguistic.sentence_of_the_day.services import GenerationError, SentenceService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sentence_of_the_day", tags=["Linguistic Insights"])


class SentenceHTTPError(HTTPException):
    """Base HTTP exception for the sentence_of_the_day module."""


class SentenceProcessingError(SentenceHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        SentenceProcessingError: Always.
    """
    logger.error("Sentence of the Day failed to generate content: %s", exc)
    raise SentenceProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the linguistic insight.",
    )


@router.post("/", response_model=SentenceResponse, status_code=status.HTTP_200_OK)
async def get_daily_sentence(
    payload: SentenceRequest,
    service: SentenceService = Depends(get_sentence_service),
    _: str = Depends(verify_api_key),
) -> SentenceResponse:
    """
    Fetches the daily featured sentence with linguistic and cultural nuances.

    Args:
        payload (SentenceRequest): The validated request schema.
        service (SentenceService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        SentenceResponse: The daily sentence and its cultural breakdown.

    Raises:
        SentenceProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate_daily_sentence(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
