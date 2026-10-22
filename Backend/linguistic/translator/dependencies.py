import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_translator_service", "verify_api_key"]


def get_translator_service() -> Iterator["TranslatorService"]:
    """
    Dependency provider for TranslatorService.

    Yields:
        TranslatorService: An initialized service instance.
    """
    from linguistic.translator.services import TranslatorService

    yield TranslatorService()
