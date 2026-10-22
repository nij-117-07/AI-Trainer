import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_vision_service", "verify_api_key"]


def get_vision_service() -> Iterator["VisionService"]:
    """
    Dependency provider for VisionService.

    Yields:
        VisionService: An initialized service instance.
    """
    from tools.vision_converter.services import VisionService

    yield VisionService()
