import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.negotiation.dependencies import get_negotiation_service
from practice.negotiation.schemas import (
    AnalyzeMessageRequest,
    AnalyzeMessageResponse,
    EvaluateSessionRequest,
    EvaluateSessionResponse,
    NegotiationTurnRequest,
    NegotiationTurnResponse,
    OpponentTurnRequest,
    OpponentTurnResponse,
    ScenarioRequest,
    ScenarioResponse,
)
from practice.negotiation.services import GenerationError, NegotiationService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/negotiation", tags=["Negotiation"])


class NegotiationHTTPError(HTTPException):
    """Base HTTP exception for the negotiation module."""


class NegotiationProcessingError(NegotiationHTTPError):
    """Raised when a DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        NegotiationProcessingError: Always.
    """
    logger.error("Negotiation module failed to %s: %s", action, exc)
    raise NegotiationProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/scenario", response_model=ScenarioResponse, status_code=status.HTTP_200_OK)
async def generate_scenario(
    payload: ScenarioRequest,
    service: NegotiationService = Depends(get_negotiation_service),
    _: str = Depends(verify_api_key),
) -> ScenarioResponse:
    """
    Generates a negotiation scenario and the opponent's opening message.

    The client's session/memory app persists the returned scenario and passes
    it back with each subsequent request.

    Args:
        payload (ScenarioRequest): The validated scenario request.
        service (NegotiationService): Injected service layer.
        _: API key guard dependency.

    Returns:
        ScenarioResponse: The generated scenario for the client to persist.

    Raises:
        NegotiationProcessingError: If the scenario pipeline fails.
    """
    try:
        return await service.generate_scenario(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the negotiation scenario", exc)


@router.post("/opponent-turn", response_model=OpponentTurnResponse, status_code=status.HTTP_200_OK)
async def get_opponent_turn(
    payload: OpponentTurnRequest,
    service: NegotiationService = Depends(get_negotiation_service),
    _: str = Depends(verify_api_key),
) -> OpponentTurnResponse:
    """
    Generates the opponent's reply and internal state for the user's message.

    Args:
        payload (OpponentTurnRequest): The validated turn request.
        service (NegotiationService): Injected service layer.
        _: API key guard dependency.

    Returns:
        OpponentTurnResponse: The opponent's reply and internal state.

    Raises:
        NegotiationProcessingError: If the opponent pipeline fails.
    """
    try:
        return await service.get_opponent_turn(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the opponent's reply", exc)


@router.post("/analyze-message", response_model=AnalyzeMessageResponse, status_code=status.HTTP_200_OK)
async def analyze_message(
    payload: AnalyzeMessageRequest,
    service: NegotiationService = Depends(get_negotiation_service),
    _: str = Depends(verify_api_key),
) -> AnalyzeMessageResponse:
    """
    Analyzes a single trainee message for negotiation tactics.

    Args:
        payload (AnalyzeMessageRequest): The validated analysis request.
        service (NegotiationService): Injected service layer.
        _: API key guard dependency.

    Returns:
        AnalyzeMessageResponse: The detected tactics and feedback.

    Raises:
        NegotiationProcessingError: If the analysis pipeline fails.
    """
    try:
        return await service.analyze_message(payload)
    except GenerationError as exc:
        _raise_processing_error("analyze the trainee's message", exc)


@router.post("/turn", response_model=NegotiationTurnResponse, status_code=status.HTTP_200_OK)
async def run_turn(
    payload: NegotiationTurnRequest,
    service: NegotiationService = Depends(get_negotiation_service),
    _: str = Depends(verify_api_key),
) -> NegotiationTurnResponse:
    """
    Runs a combined turn: opponent reply, internal state, and optional
    message-tactic analysis in a single call.

    Args:
        payload (NegotiationTurnRequest): The validated combined turn request.
        service (NegotiationService): Injected service layer.
        _: API key guard dependency.

    Returns:
        NegotiationTurnResponse: The opponent's reply, internal state, and optional analysis.

    Raises:
        NegotiationProcessingError: If any pipeline step fails.
    """
    try:
        return await service.run_turn(payload)
    except GenerationError as exc:
        _raise_processing_error("run the negotiation turn", exc)


@router.post("/evaluate", response_model=EvaluateSessionResponse, status_code=status.HTTP_200_OK)
async def evaluate_session(
    payload: EvaluateSessionRequest,
    service: NegotiationService = Depends(get_negotiation_service),
    _: str = Depends(verify_api_key),
) -> EvaluateSessionResponse:
    """
    Evaluates a completed negotiation session and provides feedback.

    Args:
        payload (EvaluateSessionRequest): The validated evaluation request.
        service (NegotiationService): Injected service layer.
        _: API key guard dependency.

    Returns:
        EvaluateSessionResponse: The overall score, category scores, and feedback.

    Raises:
        NegotiationProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_session(payload)
    except GenerationError as exc:
        _raise_processing_error("evaluate the negotiation session", exc)
