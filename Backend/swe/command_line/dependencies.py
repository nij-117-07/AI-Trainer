import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_command_line_service", "verify_api_key"]


def get_command_line_service() -> Iterator["CommandLineService"]:
    """
    Dependency provider for CommandLineService.

    Yields:
        CommandLineService: An initialized service instance.
    """
    from swe.command_line.services import CommandLineService

    yield CommandLineService()
