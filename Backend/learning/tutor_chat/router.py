import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from learning.tutor_chat.dependencies import get_tutor_chat_service
from learning.tutor_chat.schemas import TutorChatRequest, TutorChatResponse
from learning.tutor_chat.services import GenerationError, TutorChatError, TutorChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tutor_chat", tags=["Tutor Chat"])


class TutorChatHTTPError(HTTPException):
    """Base HTTP exception for the tutor chat module."""


class TutorChatProcessingError(TutorChatHTTPError):
    """Raised when the tutor chat pipeline fails to produce a response."""


def _raise_processing_error(exc: TutorChatError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (TutorChatError): The domain exception that caused the failure.

    Raises:
        TutorChatProcessingError: Always.
    """
    logger.error("Tutor chat failed to generate a response: %s", exc)
    raise TutorChatProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the tutor response.",
    )


@router.post("/chat", response_model=TutorChatResponse, status_code=status.HTTP_200_OK)
async def chat_turn(
    payload: TutorChatRequest,
    service: TutorChatService = Depends(get_tutor_chat_service),
    _: str = Depends(verify_api_key),
) -> TutorChatResponse:
    """
    Generates a personalized tutor response for the current turn.

    The client's session/memory app persists the master topic, context, and
    growing chat history, passing them back with each turn.

    Args:
        payload (TutorChatRequest): The validated chat request.
        service (TutorChatService): Injected service layer.
        _: API key guard dependency.

    Returns:
        TutorChatResponse: The tutor's reply and educational breakdown.

    Raises:
        TutorChatProcessingError: If the tutor chat pipeline fails.
    """
    try:
        return await service.chat_turn(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
