import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_negotiation_service", "verify_api_key"]


def get_negotiation_service() -> Iterator["NegotiationService"]:
    """
    Dependency provider for NegotiationService.

    Yields:
        NegotiationService: An initialized service instance.
    """
    from practice.negotiation.services import NegotiationService

    yield NegotiationService()
