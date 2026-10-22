import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_poet_service", "verify_api_key"]


def get_poet_service() -> Iterator["PoetService"]:
    """
    Dependency provider for PoetService.

    Yields:
        PoetService: An initialized service instance.
    """
    from linguistic.poet_engine.services import PoetService

    yield PoetService()
