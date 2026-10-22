import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from core.security import verify_api_key
from learning.explainer.dependencies import get_explainer_service, get_orchestrator_service
from learning.explainer.schemas import (
    AtoZRequest,
    AtoZResponse,
    ExplanationRequest,
    ExplanationResponse,
    FeynmanRequest,
    FeynmanResponse,
    LearningPathRequest,
    LearningPathResponse,
    OrchestratorRequest,
    SocraticRequest,
    SocraticResponse,
    TutorialRequest,
    TutorialResponse,
)
from learning.explainer.services import ExplainerError, ExplainerService, OrchestratorService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/explainer", tags=["Explainer"])


class ExplainerHTTPError(HTTPException):
    """Base HTTP exception for the explainer module."""


class ExplainerProcessingError(ExplainerHTTPError):
    """Raised when the explainer pipeline fails to generate content."""


def _raise_processing_error(action: str, exc: ExplainerError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (ExplainerError): The domain exception that caused the failure.

    Raises:
        ExplainerProcessingError: Always.
    """
    logger.error("Explainer failed to %s: %s", action, exc)
    raise ExplainerProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/explain", response_model=ExplanationResponse, status_code=status.HTTP_200_OK)
async def explain_topic(
    request_data: ExplanationRequest,
    service: ExplainerService = Depends(get_explainer_service),
    _: str = Depends(verify_api_key),
) -> ExplanationResponse:
    """
    Generates a structured explanation for a given topic using AI reasoning.

    Args:
        request_data (ExplanationRequest): Input parameters.
        service (ExplainerService): Injected service layer.

    Returns:
        ExplanationResponse: The generated content.

    Raises:
        ExplainerProcessingError: If the underlying pipeline fails.
    """
    try:
        result = service.generate_explanation(request_data)
        return ExplanationResponse(**result)
    except ExplainerError as exc:
        _raise_processing_error("generate the explanation", exc)


@router.post("/atoz", response_model=TutorialResponse, status_code=status.HTTP_200_OK)
async def create_tutorial(
    request_data: TutorialRequest,
    service: ExplainerService = Depends(get_explainer_service),
    _: str = Depends(verify_api_key),
) -> TutorialResponse:
    """
    Generates a high-depth Markdown tutorial (A-to-Z).

    Args:
        request_data (TutorialRequest): Topic and style parameters.
        service (ExplainerService): Injected service layer.

    Returns:
        TutorialResponse: A single cohesive Markdown string.

    Raises:
        ExplainerProcessingError: If the underlying pipeline fails.
    """
    try:
        content = service.generate_tutorial(request_data)
        return TutorialResponse(full_explanation=content)
    except ExplainerError as exc:
        _raise_processing_error("generate the comprehensive tutorial", exc)


@router.post("/atozpointer", response_model=AtoZResponse, status_code=status.HTTP_200_OK)
async def get_atoz_explanation(
    request: AtoZRequest,
    service: ExplainerService = Depends(get_explainer_service),
    _: str = Depends(verify_api_key),
) -> AtoZResponse:
    """
    Generates a structured A-to-Z roadmap with concept pointers.

    Args:
        request (AtoZRequest): Topic, level and style parameters.
        service (ExplainerService): Injected service layer.

    Returns:
        AtoZResponse: The structured roadmap data.

    Raises:
        ExplainerProcessingError: If the underlying pipeline fails.
    """
    try:
        result = service.generate_atoz_roadmap(request)
        return AtoZResponse(**result)
    except ExplainerError as exc:
        _raise_processing_error("generate the structured roadmap", exc)


@router.post("/feynman", response_model=FeynmanResponse, status_code=status.HTTP_200_OK)
async def explain_like_im_five(
    request: FeynmanRequest,
    service: ExplainerService = Depends(get_explainer_service),
    _: str = Depends(verify_api_key),
) -> FeynmanResponse:
    """
    Simplifies complex concepts using metaphors and child-friendly language.

    Args:
        request (FeynmanRequest): Topic and target age.
        service (ExplainerService): Injected service layer.

    Returns:
        FeynmanResponse: The simplified explanation.

    Raises:
        ExplainerProcessingError: If the underlying pipeline fails.
    """
    try:
        result = service.generate_feynman_explanation(request)
        return FeynmanResponse(**result)
    except ExplainerError as exc:
        _raise_processing_error("generate the Feynman simplification", exc)


@router.post("/orchestrate-stream", status_code=status.HTTP_200_OK)
async def orchestrate_journey_stream(
    request: OrchestratorRequest,
    service: OrchestratorService = Depends(get_orchestrator_service),
    _: str = Depends(verify_api_key),
) -> StreamingResponse:
    """
    Streams a comprehensive A-to-Z explanation via Server-Sent Events.

    1. Sends a 'plan' event with all chapter titles.
    2. Sends a 'chapter' event as each deep-dive is generated.

    Args:
        request (OrchestratorRequest): Topic and expertise level.
        service (OrchestratorService): Injected orchestrator service.

    Returns:
        StreamingResponse: An SSE stream of plan/chapter events.
    """
    return StreamingResponse(
        service.stream_atoz_journey(request.topic, request.expertise),
        media_type="text/event-stream",
    )


@router.post("/socratic-mentor", response_model=SocraticResponse, status_code=status.HTTP_200_OK)
async def get_socratic_session(
    request: SocraticRequest,
    service: ExplainerService = Depends(get_explainer_service),
    _: str = Depends(verify_api_key),
) -> SocraticResponse:
    """
    Triggers a Socratic session to challenge the learner's understanding.

    Args:
        request (SocraticRequest): Topic, context and question category.
        service (ExplainerService): Injected service layer.

    Returns:
        SocraticResponse: The pedagogical goal and questions.

    Raises:
        ExplainerProcessingError: If the underlying pipeline fails.
    """
    try:
        result = service.generate_socratic_questions(request)
        return SocraticResponse(**result)
    except ExplainerError as exc:
        _raise_processing_error("initialize the Socratic session", exc)


@router.post("/curriculum-path", response_model=LearningPathResponse, status_code=status.HTTP_200_OK)
async def create_learning_session(
    request: LearningPathRequest,
    service: ExplainerService = Depends(get_explainer_service),
    _: str = Depends(verify_api_key),
) -> LearningPathResponse:
    """
    Initializes a personalized learning roadmap.

    Args:
        request (LearningPathRequest): Topic, history and goals.
        service (ExplainerService): Injected service layer.

    Returns:
        LearningPathResponse: The personalized learning path.

    Raises:
        ExplainerProcessingError: If the underlying pipeline fails.
    """
    try:
        result = service.generate_learning_path(request)
        return LearningPathResponse(**result)
    except ExplainerError as exc:
        _raise_processing_error("architect the curriculum", exc)
