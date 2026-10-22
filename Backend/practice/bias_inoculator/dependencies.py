import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_bias_inoculator_service", "verify_api_key"]


def get_bias_inoculator_service() -> Iterator["BiasInoculatorService"]:
    """
    Dependency provider for BiasInoculatorService.

    Yields:
        BiasInoculatorService: An initialized service instance.
    """
    from practice.bias_inoculator.services import BiasInoculatorService

    yield BiasInoculatorService()
