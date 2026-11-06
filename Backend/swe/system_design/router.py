import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from swe.system_design.dependencies import get_system_design_service, verify_api_key
from swe.system_design.schemas import (
    ArchitectureEvaluationRequest,
    ArchitectureEvaluationResponse,
    BottleneckDetectionRequest,
    BottleneckDetectionResponse,
    ComponentChoiceRequest,
    ComponentChoiceResponse,
    DesignScoreRequest,
    DesignScoreResponse,
    RequirementsClarificationRequest,
    RequirementsClarificationResponse,
    ScalabilityAssessmentRequest,
    ScalabilityAssessmentResponse,
    SystemDesignPromptRequest,
    SystemDesignPromptResponse,
    TradeoffAnalysisRequest,
    TradeoffAnalysisResponse,
)
from swe.system_design.services import GenerationError, SystemDesignService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/system-design",
    tags=["System Design"],
    dependencies=[Depends(verify_api_key)],
)


class SystemDesignHTTPError(HTTPException):
    """Base HTTP exception for the system design module."""


class SystemDesignProcessingError(SystemDesignHTTPError):
    """Raised when the system design pipeline fails to produce a result."""


def _raise_generation_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        SystemDesignProcessingError: Always, with a 500 status code.
    """
    logger.error("System design module failed to produce a result: %s", exc)
    raise SystemDesignProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the system design result.",
    )


@router.post("/problems/generate", response_model=SystemDesignPromptResponse, status_code=status.HTTP_200_OK)
async def generate_prompt(
    payload: SystemDesignPromptRequest,
    service: SystemDesignService = Depends(get_system_design_service),
) -> SystemDesignPromptResponse:
    """
    Generates a system design problem with requirements and traffic estimates.

    Args:
        payload: The problem generation request.
        service: Injected system design service.

    Returns:
        SystemDesignPromptResponse: The generated problem.

    Raises:
        SystemDesignProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_prompt(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/requirements/clarify", response_model=RequirementsClarificationResponse, status_code=status.HTTP_200_OK)
async def clarify_requirements(
    payload: RequirementsClarificationRequest,
    service: SystemDesignService = Depends(get_system_design_service),
) -> RequirementsClarificationResponse:
    """
    Evaluates the questions and assumptions from the clarification phase.

    Args:
        payload: The clarification request.
        service: Injected system design service.

    Returns:
        RequirementsClarificationResponse: The clarification score and feedback.

    Raises:
        SystemDesignProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.clarify_requirements(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/architecture/evaluate", response_model=ArchitectureEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_architecture(
    payload: ArchitectureEvaluationRequest,
    service: SystemDesignService = Depends(get_system_design_service),
) -> ArchitectureEvaluationResponse:
    """
    Evaluates the proposed high-level architecture against the requirements.

    Args:
        payload: The architecture evaluation request.
        service: Injected system design service.

    Returns:
        ArchitectureEvaluationResponse: Scores, missing components, and data flow analysis.

    Raises:
        SystemDesignProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_architecture(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/components/evaluate", response_model=ComponentChoiceResponse, status_code=status.HTTP_200_OK)
async def evaluate_component_choice(
    payload: ComponentChoiceRequest,
    service: SystemDesignService = Depends(get_system_design_service),
) -> ComponentChoiceResponse:
    """
    Evaluates one technology choice for a component.

    Args:
        payload: The component choice request.
        service: Injected system design service.

    Returns:
        ComponentChoiceResponse: The rating, alternatives, and interview feedback.

    Raises:
        SystemDesignProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_component_choice(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/tradeoffs/analyze", response_model=TradeoffAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_tradeoffs(
    payload: TradeoffAnalysisRequest,
    service: SystemDesignService = Depends(get_system_design_service),
) -> TradeoffAnalysisResponse:
    """
    Analyses the gains and costs of each major design decision.

    Args:
        payload: The tradeoff analysis request.
        service: Injected system design service.

    Returns:
        TradeoffAnalysisResponse: Tradeoff analysis and overall awareness rating.

    Raises:
        SystemDesignProcessingError: If the analysis pipeline fails.
    """
    try:
        return await service.analyze_tradeoffs(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/scalability/assess", response_model=ScalabilityAssessmentResponse, status_code=status.HTTP_200_OK)
async def assess_scalability(
    payload: ScalabilityAssessmentRequest,
    service: SystemDesignService = Depends(get_system_design_service),
) -> ScalabilityAssessmentResponse:
    """
    Assesses how the design behaves at higher load and identifies breaking points.

    Args:
        payload: The scalability assessment request.
        service: Injected system design service.

    Returns:
        ScalabilityAssessmentResponse: Scalability score, bottlenecks, and scaling stages.

    Raises:
        SystemDesignProcessingError: If the assessment pipeline fails.
    """
    try:
        return await service.assess_scalability(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/bottlenecks/detect", response_model=BottleneckDetectionResponse, status_code=status.HTTP_200_OK)
async def detect_bottlenecks(
    payload: BottleneckDetectionRequest,
    service: SystemDesignService = Depends(get_system_design_service),
) -> BottleneckDetectionResponse:
    """
    Finds performance bottlenecks along the key data flows.

    Args:
        payload: The bottleneck detection request.
        service: Injected system design service.

    Returns:
        BottleneckDetectionResponse: Bottlenecks, latency breakdown, and hot paths.

    Raises:
        SystemDesignProcessingError: If the detection pipeline fails.
    """
    try:
        return await service.detect_bottlenecks(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/designs/score", response_model=DesignScoreResponse, status_code=status.HTTP_200_OK)
async def score_design(
    payload: DesignScoreRequest,
    service: SystemDesignService = Depends(get_system_design_service),
) -> DesignScoreResponse:
    """
    Produces the final multi-dimension score for a complete design submission.

    Args:
        payload: The design score request.
        service: Injected system design service.

    Returns:
        DesignScoreResponse: Overall score, grade, dimension scores, and roadmap.

    Raises:
        SystemDesignProcessingError: If the scoring pipeline fails.
    """
    try:
        return await service.score_design(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)
