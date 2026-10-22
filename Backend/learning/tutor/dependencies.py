import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_tutor_service", "get_prompt_service", "verify_api_key"]


def get_tutor_service() -> Iterator["TutorService"]:
    """
    Dependency provider for TutorService.

    Yields:
        TutorService: An initialized service instance.
    """
    from learning.tutor.services import TutorService

    yield TutorService()


def get_prompt_service() -> Iterator["PromptService"]:
    """
    Dependency provider for PromptService.

    Yields:
        PromptService: An initialized service instance.
    """
    from learning.tutor.services import PromptService

    yield PromptService()
