import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.debate.dependencies import get_debate_service
from practice.debate.schemas import (
    DebateTurnRequest,
    DebateTurnResponse,
    JudgeRequest,
    JudgeResponse,
    PersonaRequest,
    PersonaResponse,
)
from practice.debate.services import DebateError, DebateService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/debate", tags=["Debate"])


class DebateHTTPError(HTTPException):
    """Base HTTP exception for the debate module."""


class DebateProcessingError(DebateHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: DebateError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (DebateError): The domain exception that caused the failure.

    Raises:
        DebateProcessingError: Always.
    """
    logger.error("Debate module failed to %s: %s", action, exc)
    raise DebateProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/persona", response_model=PersonaResponse, status_code=status.HTTP_200_OK)
async def create_persona(
    payload: PersonaRequest,
    service: DebateService = Depends(get_debate_service),
    _: str = Depends(verify_api_key),
) -> PersonaResponse:
    """
    Generates a specialized debate persona and system prompt.

    The client's session/memory app persists the persona profile and passes
    its system_prompt back with each turn request.

    Args:
        payload (PersonaRequest): The validated persona request.
        service (DebateService): Injected service layer.
        _: API key guard dependency.

    Returns:
        PersonaResponse: The generated persona profile.

    Raises:
        DebateProcessingError: If the persona pipeline fails.
    """
    try:
        return await service.create_persona(payload)
    except GenerationError as exc:
        _raise_processing_error("create the debate persona", exc)


@router.post("/turn", response_model=DebateTurnResponse, status_code=status.HTTP_200_OK)
async def execute_turn(
    payload: DebateTurnRequest,
    service: DebateService = Depends(get_debate_service),
    _: str = Depends(verify_api_key),
) -> DebateTurnResponse:
    """
    Executes a single debate turn for a given persona.

    Args:
        payload (DebateTurnRequest): The validated turn request.
        service (DebateService): Injected service layer.
        _: API key guard dependency.

    Returns:
        DebateTurnResponse: The generated argument and rebuttal.

    Raises:
        DebateProcessingError: If the turn pipeline fails.
    """
    try:
        return await service.execute_turn(payload)
    except GenerationError as exc:
        _raise_processing_error("execute the debate turn", exc)


@router.post("/judge", response_model=JudgeResponse, status_code=status.HTTP_200_OK)
async def judge_debate(
    payload: JudgeRequest,
    service: DebateService = Depends(get_debate_service),
    _: str = Depends(verify_api_key),
) -> JudgeResponse:
    """
    Judges a completed debate transcript and returns a verdict.

    Args:
        payload (JudgeRequest): The validated judge request.
        service (DebateService): Injected service layer.
        _: API key guard dependency.

    Returns:
        JudgeResponse: The scores, verdict, and judge feedback.

    Raises:
        DebateProcessingError: If the judge pipeline fails.
    """
    try:
        return await service.judge_debate(payload)
    except GenerationError as exc:
        _raise_processing_error("judge the debate", exc)
