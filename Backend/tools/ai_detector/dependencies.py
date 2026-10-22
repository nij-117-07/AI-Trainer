import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_ai_detector_service", "verify_api_key"]


def get_ai_detector_service() -> Iterator["AIDetectorService"]:
    """
    Dependency provider for AIDetectorService.

    Yields:
        AIDetectorService: An initialized service instance.
    """
    from tools.ai_detector.services import AIDetectorService

    yield AIDetectorService()
