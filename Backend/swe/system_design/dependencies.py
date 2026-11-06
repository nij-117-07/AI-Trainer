import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_system_design_service", "verify_api_key"]


def get_system_design_service() -> Iterator["SystemDesignService"]:
    """
    Dependency provider for SystemDesignService.

    Yields:
        SystemDesignService: An initialized service instance.
    """
    from swe.system_design.services import SystemDesignService

    yield SystemDesignService()
