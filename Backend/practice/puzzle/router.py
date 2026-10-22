import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.puzzle.dependencies import get_puzzle_service
from practice.puzzle.schemas import (
    PuzzleEvaluationRequest,
    PuzzleEvaluationResponse,
    PuzzleRequest,
    PuzzleResponse,
)
from practice.puzzle.services import GenerationError, PuzzleError, PuzzleService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/puzzle", tags=["Puzzle Generator"])


class PuzzleHTTPError(HTTPException):
    """Base HTTP exception for the puzzle module."""


class PuzzleProcessingError(PuzzleHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: PuzzleError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (PuzzleError): The domain exception that caused the failure.

    Raises:
        PuzzleProcessingError: Always.
    """
    logger.error("Puzzle module failed to %s: %s", action, exc)
    raise PuzzleProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=PuzzleResponse, status_code=status.HTTP_200_OK)
async def generate_puzzle(
    payload: PuzzleRequest,
    service: PuzzleService = Depends(get_puzzle_service),
    _: str = Depends(verify_api_key),
) -> PuzzleResponse:
    """
    Generates a personalized cognitive puzzle.

    Args:
        payload (PuzzleRequest): The validated request.
        service (PuzzleService): Injected service layer.
        _: API key guard dependency.

    Returns:
        PuzzleResponse: The generated puzzle.

    Raises:
        PuzzleProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_puzzle(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the puzzle", exc)


@router.post("/evaluate", response_model=PuzzleEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_puzzle(
    payload: PuzzleEvaluationRequest,
    service: PuzzleService = Depends(get_puzzle_service),
    _: str = Depends(verify_api_key),
) -> PuzzleEvaluationResponse:
    """
    Evaluates a puzzle attempt with accuracy scoring and metacognitive prompts.

    Args:
        payload (PuzzleEvaluationRequest): The validated request.
        service (PuzzleService): Injected service layer.
        _: API key guard dependency.

    Returns:
        PuzzleEvaluationResponse: The evaluation result.

    Raises:
        PuzzleProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_puzzle(payload)
    except GenerationError as exc:
        _raise_processing_error("evaluate the puzzle attempt", exc)
