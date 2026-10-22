import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from core.tracing import log_api_trace
from practice.interview.dependencies import get_interview_service
from practice.interview.schemas import (
    AnswerReviewRequest,
    AnswerReviewResponse,
    ProgressTrackRequest,
    ProgressTrackResponse,
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    SessionDecideRequest,
    SessionDecideResponse,
)
from practice.interview.services import GenerationError, InterviewError, InterviewService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interview", tags=["Interview Simulator"])


class InterviewHTTPError(HTTPException):
    """Base HTTP exception for the interview module."""


class InterviewProcessingError(InterviewHTTPError):
    """Raised when an AI pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: InterviewError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (InterviewError): The domain exception that caused the failure.

    Raises:
        InterviewProcessingError: Always.
    """
    logger.error("Interview failed to %s: %s", action, exc)
    raise InterviewProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/session/decide", response_model=SessionDecideResponse, status_code=status.HTTP_200_OK)
async def decide_session(
    payload: SessionDecideRequest,
    service: InterviewService = Depends(get_interview_service),
    _: str = Depends(verify_api_key),
) -> SessionDecideResponse:
    """
    Runs the SessionManager signature: choose the next strategic interview action.

    The client's session app owns all state and passes the full session context
    back on every call.

    Args:
        payload (SessionDecideRequest): The validated decision request.
        service (InterviewService): Injected service layer.
        _: API key guard dependency.

    Returns:
        SessionDecideResponse: The next action, reasoning, and directive.

    Raises:
        InterviewProcessingError: If the decision pipeline fails.
    """
    try:
        result = await service.decide_next(payload)
        log_api_trace("Interview | session-decide", payload, result, logger)
        return result
    except GenerationError as exc:
        _raise_processing_error("decide the next interview step", exc)


@router.post("/question/generate", response_model=QuestionGenerateResponse, status_code=status.HTTP_200_OK)
async def generate_question(
    payload: QuestionGenerateRequest,
    service: InterviewService = Depends(get_interview_service),
    _: str = Depends(verify_api_key),
) -> QuestionGenerateResponse:
    """
    Runs the QuestionGenerator signature: craft the next interview question.

    Args:
        payload (QuestionGenerateRequest): The validated generation request.
        service (InterviewService): Injected service layer.
        _: API key guard dependency.

    Returns:
        QuestionGenerateResponse: The question and reviewer calibration data.

    Raises:
        InterviewProcessingError: If the question pipeline fails.
    """
    try:
        result = await service.generate_question(payload)
        log_api_trace("Interview | question-generate", payload, result, logger)
        return result
    except GenerationError as exc:
        _raise_processing_error("generate the interview question", exc)


@router.post("/answer/review", response_model=AnswerReviewResponse, status_code=status.HTTP_200_OK)
async def review_answer(
    payload: AnswerReviewRequest,
    service: InterviewService = Depends(get_interview_service),
    _: str = Depends(verify_api_key),
) -> AnswerReviewResponse:
    """
    Runs the AnswerReviewer signature: score and critique a candidate answer.

    Args:
        payload (AnswerReviewRequest): The validated review request.
        service (InterviewService): Injected service layer.
        _: API key guard dependency.

    Returns:
        AnswerReviewResponse: Scores, feedback, and the recommendation signal.

    Raises:
        InterviewProcessingError: If the review pipeline fails.
    """
    try:
        result = await service.review_answer(payload)
        log_api_trace("Interview | answer-review", payload, result, logger)
        return result
    except GenerationError as exc:
        _raise_processing_error("review the candidate answer", exc)


@router.post("/progress/track", response_model=ProgressTrackResponse, status_code=status.HTTP_200_OK)
async def track_progress(
    payload: ProgressTrackRequest,
    service: InterviewService = Depends(get_interview_service),
    _: str = Depends(verify_api_key),
) -> ProgressTrackResponse:
    """
    Runs the ProgressTracker signature: merge the latest review into the
    candidate's performance profile.

    Args:
        payload (ProgressTrackRequest): The validated progress request.
        service (InterviewService): Injected service layer.
        _: API key guard dependency.

    Returns:
        ProgressTrackResponse: The updated profile and performance trend.

    Raises:
        InterviewProcessingError: If the progress pipeline fails.
    """
    try:
        result = await service.track_progress(payload)
        log_api_trace("Interview | progress-track", payload, result, logger)
        return result
    except GenerationError as exc:
        _raise_processing_error("update the performance profile", exc)
