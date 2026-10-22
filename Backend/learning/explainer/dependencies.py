import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_explainer_service", "get_orchestrator_service", "verify_api_key"]


def get_explainer_service() -> Iterator["ExplainerService"]:
    """
    Dependency provider for ExplainerService.

    Yields:
        ExplainerService: An initialized service instance.
    """
    from learning.explainer.services import ExplainerService

    yield ExplainerService()


def get_orchestrator_service() -> Iterator["OrchestratorService"]:
    """
    Dependency provider for OrchestratorService.

    Yields:
        OrchestratorService: An initialized service instance.
    """
    from learning.explainer.services import OrchestratorService

    yield OrchestratorService()
