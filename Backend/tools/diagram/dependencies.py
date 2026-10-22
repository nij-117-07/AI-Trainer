import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_diagram_service", "verify_api_key"]


def get_diagram_service() -> Iterator["DiagramService"]:
    """
    Dependency provider for DiagramService.

    Yields:
        DiagramService: An initialized service instance.
    """
    from tools.diagram.services import DiagramService

    yield DiagramService()
