import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.clarity_trainer.dependencies import get_clarity_trainer_service
from practice.clarity_trainer.schemas import (
    EvaluateRequest,
    EvaluateResponse,
    ScenarioRequest,
    ScenarioResponse,
)
from practice.clarity_trainer.services import ClarityTrainerService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/clarity_trainer", tags=["Clarity Trainer"])


class ClarityTrainerHTTPError(HTTPException):
    """Base HTTP exception for the clarity trainer module."""


class ClarityTrainerProcessingError(ClarityTrainerHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        ClarityTrainerProcessingError: Always.
    """
    logger.error("Clarity trainer failed to %s: %s", action, exc)
    raise ClarityTrainerProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/scenario", response_model=ScenarioResponse, status_code=status.HTTP_200_OK)
async def generate_scenario(
    payload: ScenarioRequest,
    service: ClarityTrainerService = Depends(get_clarity_trainer_service),
    _: str = Depends(verify_api_key),
) -> ScenarioResponse:
    """
    Generates a communication practice scenario.

    The client's session/memory app persists the returned scenario and passes
    it back with the evaluation request.

    Args:
        payload (ScenarioRequest): The validated scenario request.
        service (ClarityTrainerService): Injected service layer.
        _: API key guard dependency.

    Returns:
        ScenarioResponse: The generated scenario for the client to persist.

    Raises:
        ClarityTrainerProcessingError: If the scenario pipeline fails.
    """
    try:
        return await service.generate_scenario(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the communication scenario", exc)


@router.post("/evaluate", response_model=EvaluateResponse, status_code=status.HTTP_200_OK)
async def evaluate_response(
    payload: EvaluateRequest,
    service: ClarityTrainerService = Depends(get_clarity_trainer_service),
    _: str = Depends(verify_api_key),
) -> EvaluateResponse:
    """
    Runs the full clarity evaluation pipeline: analysis, coach feedback,
    concise rewrite, and gold-standard response.

    Args:
        payload (EvaluateRequest): The validated evaluation request.
        service (ClarityTrainerService): Injected service layer.
        _: API key guard dependency.

    Returns:
        EvaluateResponse: The analysis, feedback, rewrite, and gold standard.

    Raises:
        ClarityTrainerProcessingError: If any pipeline step fails.
    """
    try:
        return await service.evaluate(payload)
    except GenerationError as exc:
        _raise_processing_error("evaluate the user's response", exc)
