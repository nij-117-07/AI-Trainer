import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_tutor_chat_service", "verify_api_key"]


def get_tutor_chat_service() -> Iterator["TutorChatService"]:
    """
    Dependency provider for TutorChatService.

    Yields:
        TutorChatService: An initialized service instance.
    """
    from learning.tutor_chat.services import TutorChatService

    yield TutorChatService()
