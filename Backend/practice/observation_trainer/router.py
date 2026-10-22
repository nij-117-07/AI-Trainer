import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.observation_trainer.dependencies import get_observation_trainer_service
from practice.observation_trainer.schemas import (
    DescribeRequest,
    DescribeResponse,
    EvaluateRequest,
    EvaluateResponse,
    RevealHiddenRequest,
    RevealHiddenResponse,
    TrainRequest,
    TrainResponse,
)
from practice.observation_trainer.services import GenerationError, ObservationTrainerService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/observation_trainer", tags=["Observation Trainer"])


class ObservationTrainerHTTPError(HTTPException):
    """Base HTTP exception for the observation trainer module."""


class ObservationTrainerProcessingError(ObservationTrainerHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        ObservationTrainerProcessingError: Always.
    """
    logger.error("Observation trainer failed to %s: %s", action, exc)
    raise ObservationTrainerProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/describe", response_model=DescribeResponse, status_code=status.HTTP_200_OK)
async def describe_image(
    payload: DescribeRequest,
    service: ObservationTrainerService = Depends(get_observation_trainer_service),
    _: str = Depends(verify_api_key),
) -> DescribeResponse:
    """
    Generates a structured ground-truth description of an image.

    Args:
        payload (DescribeRequest): The validated image description request.
        service (ObservationTrainerService): Injected service layer.
        _: API key guard dependency.

    Returns:
        DescribeResponse: The structured description of the image.

    Raises:
        ObservationTrainerProcessingError: If the vision pipeline fails.
    """
    try:
        return await service.describe(payload)
    except GenerationError as exc:
        _raise_processing_error("describe the image", exc)


@router.post("/evaluate", response_model=EvaluateResponse, status_code=status.HTTP_200_OK)
async def evaluate_observations(
    payload: EvaluateRequest,
    service: ObservationTrainerService = Depends(get_observation_trainer_service),
    _: str = Depends(verify_api_key),
) -> EvaluateResponse:
    """
    Evaluates a user's observations against the ground truth of an image.

    Args:
        payload (EvaluateRequest): The validated evaluation request.
        service (ObservationTrainerService): Injected service layer.
        _: API key guard dependency.

    Returns:
        EvaluateResponse: The observation evaluation summary.

    Raises:
        ObservationTrainerProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate(payload)
    except GenerationError as exc:
        _raise_processing_error("evaluate the observations", exc)


@router.post("/reveal-hidden", response_model=RevealHiddenResponse, status_code=status.HTTP_200_OK)
async def reveal_hidden_details(
    payload: RevealHiddenRequest,
    service: ObservationTrainerService = Depends(get_observation_trainer_service),
    _: str = Depends(verify_api_key),
) -> RevealHiddenResponse:
    """
    Reveals details the user likely missed, with scenario-tailored training tips.

    Args:
        payload (RevealHiddenRequest): The validated reveal request.
        service (ObservationTrainerService): Injected service layer.
        _: API key guard dependency.

    Returns:
        RevealHiddenResponse: The missed details and training guidance.

    Raises:
        ObservationTrainerProcessingError: If the reveal pipeline fails.
    """
    try:
        return await service.reveal_hidden(payload)
    except GenerationError as exc:
        _raise_processing_error("reveal the hidden details", exc)


@router.post("/train", response_model=TrainResponse, status_code=status.HTTP_200_OK)
async def run_training(
    payload: TrainRequest,
    service: ObservationTrainerService = Depends(get_observation_trainer_service),
    _: str = Depends(verify_api_key),
) -> TrainResponse:
    """
    Runs the full observation training pipeline: describe, evaluate, and
    optionally reveal hidden details.

    Args:
        payload (TrainRequest): The validated training request.
        service (ObservationTrainerService): Injected service layer.
        _: API key guard dependency.

    Returns:
        TrainResponse: The image analysis, evaluation, and optional hidden details.

    Raises:
        ObservationTrainerProcessingError: If any pipeline step fails.
    """
    try:
        return await service.run_training(payload)
    except GenerationError as exc:
        _raise_processing_error("run the training pipeline", exc)
