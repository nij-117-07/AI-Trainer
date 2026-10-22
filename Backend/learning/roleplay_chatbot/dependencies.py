import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_roleplay_chat_service", "verify_api_key"]


def get_roleplay_chat_service() -> Iterator["RoleplayChatService"]:
    """
    Dependency provider for RoleplayChatService.

    Yields:
        RoleplayChatService: An initialized service instance.
    """
    from learning.roleplay_chatbot.services import RoleplayChatService

    yield RoleplayChatService()
