import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_word_of_the_day_service", "verify_api_key"]


def get_word_of_the_day_service() -> Iterator["WordOfTheDayService"]:
    """
    Dependency provider for WordOfTheDayService.

    Yields:
        WordOfTheDayService: An initialized service instance.
    """
    from linguistic.word_of_the_day.services import WordOfTheDayService

    yield WordOfTheDayService()
