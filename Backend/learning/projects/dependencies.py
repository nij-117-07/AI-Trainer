import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_project_recommender_service", "verify_api_key"]


def get_project_recommender_service() -> Iterator["ProjectRecommenderService"]:
    """
    Dependency provider for ProjectRecommenderService.

    Yields:
        ProjectRecommenderService: An initialized service instance.
    """
    from learning.projects.services import ProjectRecommenderService

    yield ProjectRecommenderService()
