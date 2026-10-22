import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from learning.roleplay_chatbot.dependencies import get_roleplay_chat_service
from learning.roleplay_chatbot.schemas import RoleplayChatRequest, RoleplayChatResponse
from learning.roleplay_chatbot.services import GenerationError, RoleplayChatError, RoleplayChatService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/roleplay_chatbot", tags=["Roleplay Chatbot"])


class RoleplayChatHTTPError(HTTPException):
    """Base HTTP exception for the roleplay chatbot module."""


class RoleplayChatProcessingError(RoleplayChatHTTPError):
    """Raised when the roleplay chatbot pipeline fails to produce a response."""


def _raise_processing_error(exc: RoleplayChatError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc: The domain exception that caused the failure.

    Raises:
        RoleplayChatProcessingError: Always.
    """
    logger.error("Roleplay chatbot failed to generate a response: %s", exc)
    raise RoleplayChatProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the character response.",
    )


@router.post("/chat", response_model=RoleplayChatResponse, status_code=status.HTTP_200_OK)
async def chat_turn(
    payload: RoleplayChatRequest,
    service: RoleplayChatService = Depends(get_roleplay_chat_service),
    _: str = Depends(verify_api_key),
) -> RoleplayChatResponse:
    """
    Generates an in-character response for the current roleplay turn.

    The client's session/memory app persists the system_prompt, character_name,
    and growing chat_history, passing them back with each turn.

    Args:
        payload: The validated roleplay chat request.
        service: Injected service layer.
        _: API key guard dependency.

    Returns:
        The character's reply, emotion tag, and action description.

    Raises:
        RoleplayChatProcessingError: If the roleplay pipeline fails.
    """
    try:
        return await service.chat_turn(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
