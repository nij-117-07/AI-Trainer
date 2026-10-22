import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.foresight_trainer.dependencies import get_foresight_service
from practice.foresight_trainer.schemas import (
    DecisionRequest,
    DecisionResponse,
    StartRequest,
    StartResponse,
)
from practice.foresight_trainer.services import ForesightError, ForesightService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/foresight_trainer", tags=["Foresight Trainer"])


class ForesightHTTPError(HTTPException):
    """Base HTTP exception for the foresight trainer module."""


class ForesightProcessingError(ForesightHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: ForesightError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (ForesightError): The domain exception that caused the failure.

    Raises:
        ForesightProcessingError: Always.
    """
    logger.error("Foresight trainer failed to %s: %s", action, exc)
    raise ForesightProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/start", response_model=StartResponse, status_code=status.HTTP_200_OK)
async def start_scenario(
    payload: StartRequest,
    service: ForesightService = Depends(get_foresight_service),
    _: str = Depends(verify_api_key),
) -> StartResponse:
    """
    Starts a new "What would you do?" scenario.

    The client's session/memory app persists the returned blueprint,
    scene, options, and max_scenes, then passes them back with each
    subsequent decision request.

    Args:
        payload (StartRequest): The validated start request.
        service (ForesightService): Injected service layer.
        _: API key guard dependency.

    Returns:
        StartResponse: The opening scene, options, and blueprint to persist.

    Raises:
        ForesightProcessingError: If the scenario start pipeline fails.
    """
    try:
        return await service.start_scenario(payload)
    except GenerationError as exc:
        _raise_processing_error("start the foresight scenario", exc)


@router.post("/decision", response_model=DecisionResponse, status_code=status.HTTP_200_OK)
async def process_decision(
    payload: DecisionRequest,
    service: ForesightService = Depends(get_foresight_service),
    _: str = Depends(verify_api_key),
) -> DecisionResponse:
    """
    Processes a user's decision: evaluates it, determines consequences,
    generates an insight, and advances the story (or finalizes with a
    progress report when the scenario is complete).

    Args:
        payload (DecisionRequest): The validated decision request.
        service (ForesightService): Injected service layer.
        _: API key guard dependency.

    Returns:
        DecisionResponse: The evaluation, consequences, insight, and next step.

    Raises:
        ForesightProcessingError: If the decision processing pipeline fails.
    """
    try:
        return await service.process_decision(payload)
    except GenerationError as exc:
        _raise_processing_error("process the foresight decision", exc)
