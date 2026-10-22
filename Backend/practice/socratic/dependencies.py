import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_socratic_service", "verify_api_key"]


def get_socratic_service() -> Iterator["SocraticService"]:
    """
    Dependency provider for SocraticService.

    Yields:
        SocraticService: An initialized service instance.
    """
    from practice.socratic.services import SocraticService

    yield SocraticService()
