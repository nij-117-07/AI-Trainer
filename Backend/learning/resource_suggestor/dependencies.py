import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_resource_suggest_service", "verify_api_key"]


def get_resource_suggest_service() -> Iterator["ResourceSuggestService"]:
    """
    Dependency provider for ResourceSuggestService.

    Yields:
        ResourceSuggestService: An initialized service instance.
    """
    from learning.resource_suggestor.services import ResourceSuggestService

    yield ResourceSuggestService()
