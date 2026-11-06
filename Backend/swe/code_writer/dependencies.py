import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_code_writer_service", "verify_api_key"]


def get_code_writer_service() -> Iterator["CodeWriterService"]:
    """
    Dependency provider for CodeWriterService.

    Yields:
        CodeWriterService: An initialized service instance.
    """
    from swe.code_writer.services import CodeWriterService

    yield CodeWriterService()
