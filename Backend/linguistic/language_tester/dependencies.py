import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_language_tester_service", "verify_api_key"]


def get_language_tester_service() -> Iterator["LanguageTesterService"]:
    """
    Dependency provider for LanguageTesterService.

    Yields:
        LanguageTesterService: An initialized service instance.
    """
    from linguistic.language_tester.services import LanguageTesterService

    yield LanguageTesterService()
