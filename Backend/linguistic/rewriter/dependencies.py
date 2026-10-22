import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_rewriter_service", "verify_api_key"]


def get_rewriter_service() -> Iterator["RewriterService"]:
    """
    Dependency provider for RewriterService.

    Yields:
        RewriterService: An initialized service instance.
    """
    from linguistic.rewriter.services import RewriterService

    yield RewriterService()
