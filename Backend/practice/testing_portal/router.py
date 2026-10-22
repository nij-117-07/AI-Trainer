import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from core.tracing import log_api_trace
from practice.testing_portal.dependencies import get_testing_service
from practice.testing_portal.schemas import (
    AnswerRequest,
    AnswerResponse,
    MCQRequest,
    MCQResponse,
    MCQSolverRequest,
    MCQSolverResponse,
    TheoreticalRequest,
    TheoreticalResponse,
)
from practice.testing_portal.services import TestingPortalError, TestingPortalService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/testing-portal", tags=["Testing Portal"])


class TestingPortalHTTPError(HTTPException):
    """Base HTTP exception for the testing portal module."""


class TestingPortalProcessingError(TestingPortalHTTPError):
    """Raised when an AI generation pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: TestingPortalError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (TestingPortalError): The domain exception that caused the failure.

    Raises:
        TestingPortalProcessingError: Always.
    """
    logger.error("Testing portal failed to %s: %s", action, exc)
    raise TestingPortalProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate-mcq", response_model=MCQResponse, status_code=status.HTTP_200_OK)
async def generate_mcq(
    payload: MCQRequest,
    service: TestingPortalService = Depends(get_testing_service),
    _: str = Depends(verify_api_key),
) -> MCQResponse:
    """
    Generates a set of multiple choice questions via DSPy ChainOfThought.

    Args:
        payload (MCQRequest): The validated MCQ generation request.
        service (TestingPortalService): Injected service layer.
        _: API key guard dependency.

    Returns:
        MCQResponse: The generated MCQs.

    Raises:
        TestingPortalProcessingError: If the underlying pipeline fails.
    """
    try:
        result = await service.generate_mcqs(payload)
        log_api_trace("Testing portal | generate-mcq", payload, result, logger)
        return result
    except TestingPortalError as exc:
        _raise_processing_error("generate MCQs", exc)


@router.post("/generate-theoretical", response_model=TheoreticalResponse, status_code=status.HTTP_200_OK)
async def generate_theoretical(
    payload: TheoreticalRequest,
    service: TestingPortalService = Depends(get_testing_service),
    _: str = Depends(verify_api_key),
) -> TheoreticalResponse:
    """
    Generates open-ended theoretical questions via DSPy ChainOfThought.

    Args:
        payload (TheoreticalRequest): The validated theoretical question request.
        service (TestingPortalService): Injected service layer.
        _: API key guard dependency.

    Returns:
        TheoreticalResponse: The generated theoretical questions.

    Raises:
        TestingPortalProcessingError: If the underlying pipeline fails.
    """
    try:
        result = await service.generate_theoretical(payload)
        log_api_trace("Testing portal | generate-theoretical", payload, result, logger)
        return result
    except TestingPortalError as exc:
        _raise_processing_error("generate theoretical questions", exc)


@router.post("/generate-answer", response_model=AnswerResponse, status_code=status.HTTP_200_OK)
async def generate_answer(
    payload: AnswerRequest,
    service: TestingPortalService = Depends(get_testing_service),
    _: str = Depends(verify_api_key),
) -> AnswerResponse:
    """
    Acts as a Subject Matter Expert to generate a comprehensive answer to a
    high-level question.

    Args:
        payload (AnswerRequest): The validated answer generation request.
        service (TestingPortalService): Injected service layer.
        _: API key guard dependency.

    Returns:
        AnswerResponse: The generated expert answer.

    Raises:
        TestingPortalProcessingError: If the underlying pipeline fails.
    """
    try:
        result = await service.generate_answer(payload)
        log_api_trace("Testing portal | generate-answer", payload, result, logger)
        return result
    except TestingPortalError as exc:
        _raise_processing_error("generate the SME answer", exc)


@router.post("/solve-mcq", response_model=MCQSolverResponse, status_code=status.HTTP_200_OK)
async def solve_mcq(
    payload: MCQSolverRequest,
    service: TestingPortalService = Depends(get_testing_service),
    _: str = Depends(verify_api_key),
) -> MCQSolverResponse:
    """
    Analyzes an existing MCQ, determines the correct answer (A-D), and provides
    detailed reasoning for the choice.

    Args:
        payload (MCQSolverRequest): The validated MCQ solving request.
        service (TestingPortalService): Injected service layer.
        _: API key guard dependency.

    Returns:
        MCQSolverResponse: The identified correct option and reasoning.

    Raises:
        TestingPortalProcessingError: If the underlying pipeline fails.
    """
    try:
        result = await service.solve_mcq(payload)
        log_api_trace("Testing portal | solve-mcq", payload, result, logger)
        return result
    except TestingPortalError as exc:
        _raise_processing_error("solve the MCQ", exc)
