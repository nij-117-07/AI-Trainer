import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.executive_eq.dependencies import get_executive_eq_service
from practice.executive_eq.schemas import (
    EvaluateRequest,
    EvaluateResponse,
    ScenarioRequest,
    ScenarioResponse,
    TurnRequest,
    TurnResponse,
)
from practice.executive_eq.services import ExecutiveEQError, ExecutiveEQService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/executive_eq", tags=["Executive EQ Trainer"])


class ExecutiveEQHTTPError(HTTPException):
    """Base HTTP exception for the executive EQ module."""


class ExecutiveEQProcessingError(ExecutiveEQHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: ExecutiveEQError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (ExecutiveEQError): The domain exception that caused the failure.

    Raises:
        ExecutiveEQProcessingError: Always.
    """
    logger.error("Executive EQ failed to %s: %s", action, exc)
    raise ExecutiveEQProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/scenario", response_model=ScenarioResponse, status_code=status.HTTP_200_OK)
async def generate_scenario(
    payload: ScenarioRequest,
    service: ExecutiveEQService = Depends(get_executive_eq_service),
    _: str = Depends(verify_api_key),
) -> ScenarioResponse:
    """
    Builds the simulation's foundation: setting, stakes, and NPC profile.

    Args:
        payload (ScenarioRequest): The validated request.
        service (ExecutiveEQService): Injected service layer.
        _: API key guard dependency.

    Returns:
        ScenarioResponse: The scenario foundation.

    Raises:
        ExecutiveEQProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_scenario(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the scenario", exc)


@router.post("/turn", response_model=TurnResponse, status_code=status.HTTP_200_OK)
async def run_training_loop(
    payload: TurnRequest,
    service: ExecutiveEQService = Depends(get_executive_eq_service),
    _: str = Depends(verify_api_key),
) -> TurnResponse:
    """
    Generates the NPC's next move and coaching advice for the current turn.

    Args:
        payload (TurnRequest): The validated request.
        service (ExecutiveEQService): Injected service layer.
        _: API key guard dependency.

    Returns:
        TurnResponse: The NPC's move and EQ coaching.

    Raises:
        ExecutiveEQProcessingError: If the training loop pipeline fails.
    """
    try:
        return await service.run_training_loop(payload)
    except GenerationError as exc:
        _raise_processing_error("run the training loop turn", exc)


@router.post("/evaluate", response_model=EvaluateResponse, status_code=status.HTTP_200_OK)
async def evaluate_move(
    payload: EvaluateRequest,
    service: ExecutiveEQService = Depends(get_executive_eq_service),
    _: str = Depends(verify_api_key),
) -> EvaluateResponse:
    """
    Grades the user's response against the NPC's move.

    Args:
        payload (EvaluateRequest): The validated request.
        service (ExecutiveEQService): Injected service layer.
        _: API key guard dependency.

    Returns:
        EvaluateResponse: The behavioral analysis.

    Raises:
        ExecutiveEQProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_move(payload)
    except GenerationError as exc:
        _raise_processing_error("evaluate the response", exc)
