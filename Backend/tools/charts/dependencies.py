import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_chart_service", "verify_api_key"]


def get_chart_service() -> Iterator["ChartService"]:
    """
    Dependency provider for ChartService.

    Yields:
        ChartService: An initialized service instance.
    """
    from tools.charts.services import ChartService

    yield ChartService()
