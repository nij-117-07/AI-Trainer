import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_sentence_service", "verify_api_key"]


def get_sentence_service() -> Iterator["SentenceService"]:
    """
    Dependency provider for SentenceService.

    Yields:
        SentenceService: An initialized service instance.
    """
    from linguistic.sentence_of_the_day.services import SentenceService

    yield SentenceService()
