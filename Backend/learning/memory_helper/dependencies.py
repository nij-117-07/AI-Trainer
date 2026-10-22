import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_memory_service", "verify_api_key"]


def get_memory_service() -> Iterator["MemoryService"]:
    """
    Dependency provider for MemoryService.

    Yields:
        MemoryService: An initialized service instance.
    """
    from learning.memory_helper.services import MemoryService

    yield MemoryService()
