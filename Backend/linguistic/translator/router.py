import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.translator.dependencies import get_translator_service
from linguistic.translator.schemas import TranslationRequest, TranslationResponse
from linguistic.translator.services import GenerationError, TranslatorService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/translator", tags=["Linguistic Services"])


class TranslatorHTTPError(HTTPException):
    """Base HTTP exception for the translator module."""


class TranslatorProcessingError(TranslatorHTTPError):
    """Raised when the translation pipeline fails to produce content."""


def _raise_processing_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        TranslatorProcessingError: Always.
    """
    logger.error("Translator failed to process request: %s", exc)
    raise TranslatorProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to process the translation.",
    )


@router.post("/process", response_model=TranslationResponse, status_code=status.HTTP_200_OK)
async def process_translation(
    request: TranslationRequest,
    service: TranslatorService = Depends(get_translator_service),
    _: str = Depends(verify_api_key),
) -> TranslationResponse:
    """
    Processes a contextual translation using DSPy Chain of Thought.

    Args:
        request (TranslationRequest): The validated request schema.
        service (TranslatorService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        TranslationResponse: The rationale, translated text, and cultural notes.

    Raises:
        TranslatorProcessingError: If the translation pipeline fails.
    """
    try:
        return service.translate(request)
    except GenerationError as exc:
        _raise_processing_error(exc)
