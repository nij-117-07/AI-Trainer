import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_guess_game_service", "verify_api_key"]


def get_guess_game_service() -> Iterator["GuessGameService"]:
    """
    Dependency provider for GuessGameService.

    Yields a fresh, stateless service instance per request. All game state is
    owned by the client's session/memory app and passed in with each request.

    Yields:
        GuessGameService: An initialized service instance.
    """
    from practice.guess_game.services import GuessGameService

    yield GuessGameService()
