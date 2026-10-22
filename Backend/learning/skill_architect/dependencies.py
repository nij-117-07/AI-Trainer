import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_skill_architect_service", "verify_api_key"]


def get_skill_architect_service() -> Iterator["SkillArchitectService"]:
    """
    Dependency provider for SkillArchitectService.

    Yields:
        SkillArchitectService: An initialized service instance.
    """
    from learning.skill_architect.services import SkillArchitectService

    yield SkillArchitectService()
