import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_idiom_service", "verify_api_key"]


def get_idiom_service() -> Iterator["IdiomService"]:
    """
    Dependency provider for IdiomService.

    Yields:
        IdiomService: An initialized service instance.
    """
    from linguistic.idioms.services import IdiomService

    yield IdiomService()
