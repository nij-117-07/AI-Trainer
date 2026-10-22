import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.guess_game.dependencies import get_guess_game_service
from practice.guess_game.schemas import (
    CoachRequest,
    CoachResponse,
    GameStartRequest,
    GameStartResponse,
    GuessRequest,
    GuessResponse,
    HintRequest,
    HintResponse,
)
from practice.guess_game.services import GuessGameError, GuessGameService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/guess_game", tags=["Guess Game"])


class GuessGameHTTPError(HTTPException):
    """Base HTTP exception for the guess game module."""


class GuessGameProcessingError(GuessGameHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: GuessGameError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (GuessGameError): The domain exception that caused the failure.

    Raises:
        GuessGameProcessingError: Always.
    """
    logger.error("Guess game failed to %s: %s", action, exc)
    raise GuessGameProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/start", response_model=GameStartResponse, status_code=status.HTTP_200_OK)
async def start_game(
    payload: GameStartRequest,
    service: GuessGameService = Depends(get_guess_game_service),
    _: str = Depends(verify_api_key),
) -> GameStartResponse:
    """
    Generates a mystery item, first hint, and fun fact for a new game.

    The client's session/memory app persists the returned fields and passes
    them back with each subsequent request.

    Args:
        payload (GameStartRequest): The validated start request.
        service (GuessGameService): Injected service layer.
        _: API key guard dependency.

    Returns:
        GameStartResponse: The generated setup for the client to persist.

    Raises:
        GuessGameProcessingError: If the setup pipeline fails.
    """
    try:
        return await service.start_game(payload)
    except GuessGameError as exc:
        _raise_processing_error("start the game", exc)


@router.post("/hint", response_model=HintResponse, status_code=status.HTTP_200_OK)
async def get_hint(
    payload: HintRequest,
    service: GuessGameService = Depends(get_guess_game_service),
    _: str = Depends(verify_api_key),
) -> HintResponse:
    """
    Generates the next hint without repeating previous ones.

    Args:
        payload (HintRequest): The validated hint request.
        service (GuessGameService): Injected service layer.
        _: API key guard dependency.

    Returns:
        HintResponse: The new hint and the full list of hints used so far.

    Raises:
        GuessGameProcessingError: If the hint pipeline fails.
    """
    try:
        return await service.get_hint(payload)
    except GuessGameError as exc:
        _raise_processing_error("generate the next hint", exc)


@router.post("/guess", response_model=GuessResponse, status_code=status.HTTP_200_OK)
async def check_guess(
    payload: GuessRequest,
    service: GuessGameService = Depends(get_guess_game_service),
    _: str = Depends(verify_api_key),
) -> GuessResponse:
    """
    Evaluates a user's guess against the mystery item.

    Args:
        payload (GuessRequest): The validated guess request.
        service (GuessGameService): Injected service layer.
        _: API key guard dependency.

    Returns:
        GuessResponse: The evaluation of the guess.

    Raises:
        GuessGameProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.check_guess(payload)
    except GuessGameError as exc:
        _raise_processing_error("evaluate the guess", exc)


@router.post("/coach", response_model=CoachResponse, status_code=status.HTTP_200_OK)
async def get_coaching(
    payload: CoachRequest,
    service: GuessGameService = Depends(get_guess_game_service),
    _: str = Depends(verify_api_key),
) -> CoachResponse:
    """
    Provides coaching guidance for a struggling player.

    Args:
        payload (CoachRequest): The validated coaching request.
        service (GuessGameService): Injected service layer.
        _: API key guard dependency.

    Returns:
        CoachResponse: The coaching message and mental framework.

    Raises:
        GuessGameProcessingError: If the coaching pipeline fails.
    """
    try:
        return await service.get_coaching(payload)
    except GuessGameError as exc:
        _raise_processing_error("generate the coaching guidance", exc)
