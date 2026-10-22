import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.joke_coach.dependencies import get_joke_coach_service
from practice.joke_coach.schemas import (
    ClassifyJokeRequest,
    ClassifyJokeResponse,
    CrowdSimulationRequest,
    CrowdSimulationResponse,
    EvaluateJokeRequest,
    EvaluateJokeResponse,
    GenerateJokeRequest,
    GenerateJokeResponse,
    PracticeCoachRequest,
    PracticeCoachResponse,
    RewriteJokeRequest,
    RewriteJokeResponse,
)
from practice.joke_coach.services import GenerationError, JokeCoachError, JokeCoachService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/joke_coach", tags=["Joke Coach"])


class JokeCoachHTTPError(HTTPException):
    """Base HTTP exception for the joke coach module."""


class JokeCoachProcessingError(JokeCoachHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: JokeCoachError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (JokeCoachError): The domain exception that caused the failure.

    Raises:
        JokeCoachProcessingError: Always.
    """
    logger.error("Joke coach failed to %s: %s", action, exc)
    raise JokeCoachProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=GenerateJokeResponse, status_code=status.HTTP_200_OK)
async def generate_joke(
    payload: GenerateJokeRequest,
    service: JokeCoachService = Depends(get_joke_coach_service),
    _: str = Depends(verify_api_key),
) -> GenerateJokeResponse:
    """
    Generates an original joke for the given topic, style, and audience.

    Args:
        payload (GenerateJokeRequest): The validated request.
        service (JokeCoachService): Injected service layer.
        _: API key guard dependency.

    Returns:
        GenerateJokeResponse: The generated joke and metadata.

    Raises:
        JokeCoachProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_joke(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the joke", exc)


@router.post("/evaluate", response_model=EvaluateJokeResponse, status_code=status.HTTP_200_OK)
async def evaluate_joke(
    payload: EvaluateJokeRequest,
    service: JokeCoachService = Depends(get_joke_coach_service),
    _: str = Depends(verify_api_key),
) -> EvaluateJokeResponse:
    """
    Evaluates a joke and returns structured feedback and scores.

    Args:
        payload (EvaluateJokeRequest): The validated request.
        service (JokeCoachService): Injected service layer.
        _: API key guard dependency.

    Returns:
        EvaluateJokeResponse: The scores and feedback.

    Raises:
        JokeCoachProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_joke(payload)
    except GenerationError as exc:
        _raise_processing_error("evaluate the joke", exc)


@router.post("/rewrite", response_model=RewriteJokeResponse, status_code=status.HTTP_200_OK)
async def rewrite_joke(
    payload: RewriteJokeRequest,
    service: JokeCoachService = Depends(get_joke_coach_service),
    _: str = Depends(verify_api_key),
) -> RewriteJokeResponse:
    """
    Rewrites a joke to improve a specific aspect.

    Args:
        payload (RewriteJokeRequest): The validated request.
        service (JokeCoachService): Injected service layer.
        _: API key guard dependency.

    Returns:
        RewriteJokeResponse: The improved joke and changes.

    Raises:
        JokeCoachProcessingError: If the rewrite pipeline fails.
    """
    try:
        return await service.rewrite_joke(payload)
    except GenerationError as exc:
        _raise_processing_error("rewrite the joke", exc)


@router.post("/classify", response_model=ClassifyJokeResponse, status_code=status.HTTP_200_OK)
async def classify_joke(
    payload: ClassifyJokeRequest,
    service: JokeCoachService = Depends(get_joke_coach_service),
    _: str = Depends(verify_api_key),
) -> ClassifyJokeResponse:
    """
    Classifies a joke by style, humor mechanism, structure, and difficulty.

    Args:
        payload (ClassifyJokeRequest): The validated request.
        service (JokeCoachService): Injected service layer.
        _: API key guard dependency.

    Returns:
        ClassifyJokeResponse: The categorization result.

    Raises:
        JokeCoachProcessingError: If the classification pipeline fails.
    """
    try:
        return await service.classify_joke(payload)
    except GenerationError as exc:
        _raise_processing_error("classify the joke", exc)


@router.post("/practice", response_model=PracticeCoachResponse, status_code=status.HTTP_200_OK)
async def practice_session(
    payload: PracticeCoachRequest,
    service: JokeCoachService = Depends(get_joke_coach_service),
    _: str = Depends(verify_api_key),
) -> PracticeCoachResponse:
    """
    Generates a structured joke practice session.

    Args:
        payload (PracticeCoachRequest): The validated request.
        service (JokeCoachService): Injected service layer.
        _: API key guard dependency.

    Returns:
        PracticeCoachResponse: The exercise and next steps.

    Raises:
        JokeCoachProcessingError: If the coaching pipeline fails.
    """
    try:
        return await service.practice_session(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the practice session", exc)


@router.post("/simulate-crowd", response_model=CrowdSimulationResponse, status_code=status.HTTP_200_OK)
async def simulate_crowd(
    payload: CrowdSimulationRequest,
    service: JokeCoachService = Depends(get_joke_coach_service),
    _: str = Depends(verify_api_key),
) -> CrowdSimulationResponse:
    """
    Simulates crowd response to a joke for a given venue and audience.

    Args:
        payload (CrowdSimulationRequest): The validated request.
        service (JokeCoachService): Injected service layer.
        _: API key guard dependency.

    Returns:
        CrowdSimulationResponse: The predicted reaction and risks.

    Raises:
        JokeCoachProcessingError: If the simulation pipeline fails.
    """
    try:
        return await service.simulate_crowd(payload)
    except GenerationError as exc:
        _raise_processing_error("simulate the crowd response", exc)
