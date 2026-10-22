import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_conceptual_bridge_service", "verify_api_key"]


def get_conceptual_bridge_service() -> Iterator["ConceptualBridgeService"]:
    """
    Dependency provider for ConceptualBridgeService.

    Yields:
        ConceptualBridgeService: An initialized service instance.
    """
    from practice.conceptual_bridge.services import ConceptualBridgeService

    yield ConceptualBridgeService()
