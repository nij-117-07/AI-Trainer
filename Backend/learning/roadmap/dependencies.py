import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_roadmap_service", "verify_api_key"]


def get_roadmap_service() -> Iterator["RoadmapService"]:
    """
    Dependency provider for RoadmapService.

    Yields:
        RoadmapService: An initialized service instance.
    """
    from learning.roadmap.services import RoadmapService

    yield RoadmapService()
