import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_guide_service", "verify_api_key"]


def get_guide_service() -> Iterator["GuideService"]:
    """
    Dependency provider for GuideService.

    Yields:
        GuideService: An initialized service instance.
    """
    from learning.guides.services import GuideService

    yield GuideService()
