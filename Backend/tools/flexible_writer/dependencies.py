import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_flexible_writer_service", "verify_api_key"]


def get_flexible_writer_service() -> Iterator["FlexibleWriterService"]:
    """
    Dependency provider for FlexibleWriterService.

    Yields:
        FlexibleWriterService: An initialized service instance.
    """
    from tools.flexible_writer.services import FlexibleWriterService

    yield FlexibleWriterService()
