import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_testing_service", "verify_api_key"]


def get_testing_service() -> Iterator["TestingPortalService"]:
    """
    Dependency provider for TestingPortalService.

    Yields:
        TestingPortalService: An initialized service instance.
    """
    from practice.testing_portal.services import TestingPortalService

    yield TestingPortalService()
