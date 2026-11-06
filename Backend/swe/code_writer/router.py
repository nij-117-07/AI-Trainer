import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from swe.code_writer.dependencies import get_code_writer_service, verify_api_key
from swe.code_writer.schemas import (
    CodeEvaluationRequest,
    CodeEvaluationResponse,
    CodeQualityRequest,
    CodeQualityResponse,
    HintRequest,
    HintResponse,
    ProblemGenerationRequest,
    ProblemGenerationResponse,
    SolutionExplanationRequest,
    SolutionExplanationResponse,
    TestCaseGenerationRequest,
    TestCaseGenerationResponse,
)
from swe.code_writer.services import CodeWriterService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/code-writer",
    tags=["Code Writer"],
    dependencies=[Depends(verify_api_key)],
)


class CodeWriterHTTPError(HTTPException):
    """Base HTTP exception for the code writer module."""


class CodeWriterProcessingError(CodeWriterHTTPError):
    """Raised when the code writer pipeline fails to produce a result."""


def _raise_generation_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        CodeWriterProcessingError: Always, with a 500 status code.
    """
    logger.error("Code writer failed to produce a result: %s", exc)
    raise CodeWriterProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the code writer result.",
    )


@router.post("/problems/generate", response_model=ProblemGenerationResponse, status_code=status.HTTP_200_OK)
async def generate_problem(
    payload: ProblemGenerationRequest,
    service: CodeWriterService = Depends(get_code_writer_service),
) -> ProblemGenerationResponse:
    """
    Generates a complete coding problem for a topic and difficulty.

    Args:
        payload: The problem generation request.
        service: Injected code writer service.

    Returns:
        ProblemGenerationResponse: The generated problem.

    Raises:
        CodeWriterProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_problem(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/test-cases/generate", response_model=TestCaseGenerationResponse, status_code=status.HTTP_200_OK)
async def generate_test_cases(
    payload: TestCaseGenerationRequest,
    service: CodeWriterService = Depends(get_code_writer_service),
) -> TestCaseGenerationResponse:
    """
    Generates visible and hidden test cases for a problem.

    Args:
        payload: The test case generation request.
        service: Injected code writer service.

    Returns:
        TestCaseGenerationResponse: The generated test cases.

    Raises:
        CodeWriterProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_test_cases(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/evaluate", response_model=CodeEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_submission(
    payload: CodeEvaluationRequest,
    service: CodeWriterService = Depends(get_code_writer_service),
) -> CodeEvaluationResponse:
    """
    Judges a submission against the results of its test run.

    Args:
        payload: The code evaluation request.
        service: Injected code writer service.

    Returns:
        CodeEvaluationResponse: The verdict, score, and feedback.

    Raises:
        CodeWriterProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_submission(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/quality/analyze", response_model=CodeQualityResponse, status_code=status.HTTP_200_OK)
async def analyze_quality(
    payload: CodeQualityRequest,
    service: CodeWriterService = Depends(get_code_writer_service),
) -> CodeQualityResponse:
    """
    Reviews code style, readability, and maintainability.

    Args:
        payload: The code quality request.
        service: Injected code writer service.

    Returns:
        CodeQualityResponse: The quality ratings and issues found.

    Raises:
        CodeWriterProcessingError: If the review pipeline fails.
    """
    try:
        return await service.analyze_quality(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/hints/generate", response_model=HintResponse, status_code=status.HTTP_200_OK)
async def generate_hint(
    payload: HintRequest,
    service: CodeWriterService = Depends(get_code_writer_service),
) -> HintResponse:
    """
    Produces a progressive hint without revealing the full solution.

    Args:
        payload: The hint request.
        service: Injected code writer service.

    Returns:
        HintResponse: The hint and a guiding question.

    Raises:
        CodeWriterProcessingError: If the hint pipeline fails.
    """
    try:
        return await service.generate_hint(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/solutions/explain", response_model=SolutionExplanationResponse, status_code=status.HTTP_200_OK)
async def explain_solution(
    payload: SolutionExplanationRequest,
    service: CodeWriterService = Depends(get_code_writer_service),
) -> SolutionExplanationResponse:
    """
    Explains the optimal solution and compares it with the user's approach.

    Args:
        payload: The solution explanation request.
        service: Injected code writer service.

    Returns:
        SolutionExplanationResponse: The walkthrough and complexity comparison.

    Raises:
        CodeWriterProcessingError: If the explanation pipeline fails.
    """
    try:
        return await service.explain_solution(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)
