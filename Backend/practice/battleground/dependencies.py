import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_battleground_service", "verify_api_key"]


def get_battleground_service() -> Iterator["BattlegroundService"]:
    """
    Dependency provider for BattlegroundService.

    Yields:
        BattlegroundService: An initialized service instance.
    """
    from practice.battleground.services import BattlegroundService

    yield BattlegroundService()
