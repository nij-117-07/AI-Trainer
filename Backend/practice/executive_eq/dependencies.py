import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_executive_eq_service", "verify_api_key"]


def get_executive_eq_service() -> Iterator["ExecutiveEQService"]:
    """
    Dependency provider for ExecutiveEQService.

    Yields:
        ExecutiveEQService: An initialized service instance.
    """
    from practice.executive_eq.services import ExecutiveEQService

    yield ExecutiveEQService()
