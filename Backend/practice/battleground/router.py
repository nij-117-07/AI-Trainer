import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.battleground.dependencies import get_battleground_service
from practice.battleground.schemas import (
    BattleChallengeRequest,
    BattleChallengeResponse,
    BattleEvaluateRequest,
    BattleEvaluateResponse,
    BattleStartRequest,
    BattleStartResponse,
)
from practice.battleground.services import BattlegroundError, BattlegroundService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/battleground", tags=["Battleground Simulator"])


class BattlegroundHTTPError(HTTPException):
    """Base HTTP exception for the battleground module."""


class BattlegroundProcessingError(BattlegroundHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: BattlegroundError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (BattlegroundError): The domain exception that caused the failure.

    Raises:
        BattlegroundProcessingError: Always.
    """
    logger.error("Battleground failed to %s: %s", action, exc)
    raise BattlegroundProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/init", response_model=BattleStartResponse, status_code=status.HTTP_200_OK)
async def start_battle(
    payload: BattleStartRequest,
    service: BattlegroundService = Depends(get_battleground_service),
    _: str = Depends(verify_api_key),
) -> BattleStartResponse:
    """
    Initializes a battleground simulation.

    The client's session/memory app persists the full setup (profiles,
    environment, mission, initial HP) and passes the relevant parts back
    with each subsequent challenge/evaluate request.

    Args:
        payload (BattleStartRequest): The validated start request.
        service (BattlegroundService): Injected service layer.
        _: API key guard dependency.

    Returns:
        BattleStartResponse: The full battleground setup to persist.

    Raises:
        BattlegroundProcessingError: If the init pipeline fails.
    """
    try:
        return await service.start_battle(payload)
    except GenerationError as exc:
        _raise_processing_error("initialize the battleground", exc)


@router.post("/challenge", response_model=BattleChallengeResponse, status_code=status.HTTP_200_OK)
async def get_challenge(
    payload: BattleChallengeRequest,
    service: BattlegroundService = Depends(get_battleground_service),
    _: str = Depends(verify_api_key),
) -> BattleChallengeResponse:
    """
    Generates the next round's tactical challenge from the opponent.

    Args:
        payload (BattleChallengeRequest): The validated challenge request.
        service (BattlegroundService): Injected service layer.
        _: API key guard dependency.

    Returns:
        BattleChallengeResponse: The challenge and updated learning log.

    Raises:
        BattlegroundProcessingError: If the challenge pipeline fails.
    """
    try:
        return await service.get_challenge(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the battleground challenge", exc)


@router.post("/evaluate", response_model=BattleEvaluateResponse, status_code=status.HTTP_200_OK)
async def evaluate_response(
    payload: BattleEvaluateRequest,
    service: BattlegroundService = Depends(get_battleground_service),
    _: str = Depends(verify_api_key),
) -> BattleEvaluateResponse:
    """
    Adjudicates the user's tactical response to the current challenge.

    Args:
        payload (BattleEvaluateRequest): The validated evaluate request.
        service (BattlegroundService): Injected service layer.
        _: API key guard dependency.

    Returns:
        BattleEvaluateResponse: The score, deltas, and termination state.

    Raises:
        BattlegroundProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_response(payload)
    except GenerationError as exc:
        _raise_processing_error("evaluate the battleground response", exc)
