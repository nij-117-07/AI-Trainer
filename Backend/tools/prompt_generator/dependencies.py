import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_persona_manager", "verify_api_key"]


def get_persona_manager() -> Iterator["PersonaManager"]:
    """
    Dependency provider for PersonaManager.

    Yields:
        PersonaManager: An initialized service instance.
    """
    from tools.prompt_generator.services import PersonaManager

    yield PersonaManager()
