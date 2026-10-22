import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.word_of_the_day.dependencies import get_word_of_the_day_service
from linguistic.word_of_the_day.schemas import WOTDRequest, WOTDResponse
from linguistic.word_of_the_day.services import GenerationError, WordOfTheDayService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/word_of_the_day", tags=["Word of the Day"])


class WordOfTheDayHTTPError(HTTPException):
    """Base HTTP exception for the word_of_the_day module."""


class WordOfTheDayProcessingError(WordOfTheDayHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        WordOfTheDayProcessingError: Always.
    """
    logger.error("Word of the Day failed to generate content: %s", exc)
    raise WordOfTheDayProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the Word of the Day.",
    )


@router.post("/", response_model=WOTDResponse, status_code=status.HTTP_200_OK)
async def get_word_of_the_day(
    payload: WOTDRequest,
    service: WordOfTheDayService = Depends(get_word_of_the_day_service),
    _: str = Depends(verify_api_key),
) -> WOTDResponse:
    """
    Fetches a linguistically rich Word of the Day based on the request config.

    Args:
        payload (WOTDRequest): The validated request schema.
        service (WordOfTheDayService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        WOTDResponse: The generated word and its linguistic breakdown.

    Raises:
        WordOfTheDayProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_daily_word(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
