import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.language_tester.dependencies import get_language_tester_service
from linguistic.language_tester.schemas import (
    AssessmentRequest,
    AssessmentResponse,
    EvaluationRequest,
    EvaluationResponse,
    FIBRequest,
    FIBResponse,
    RoleplayRequest,
    RoleplayResponse,
    TranslationChallengeRequest,
    TranslationChallengeResponse,
)
from linguistic.language_tester.services import GenerationError, LanguageTesterService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/language_tester", tags=["Language Assessment"])


class LanguageTesterHTTPError(HTTPException):
    """Base HTTP exception for the language_tester module."""


class LanguageTesterProcessingError(LanguageTesterHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        LanguageTesterProcessingError: Always.
    """
    logger.error("Language tester failed to %s: %s", action, exc)
    raise LanguageTesterProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=AssessmentResponse, status_code=status.HTTP_200_OK)
async def create_assessment(
    request_data: AssessmentRequest,
    service: LanguageTesterService = Depends(get_language_tester_service),
    _: str = Depends(verify_api_key),
) -> AssessmentResponse:
    """
    Generates a personalized MCQ assessment based on CEFR level and scenario.

    Args:
        request_data (AssessmentRequest): The validated request schema.
        service (LanguageTesterService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        AssessmentResponse: The generated assessment.

    Raises:
        LanguageTesterProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate_assessment(request_data)
    except GenerationError as exc:
        _raise_processing_error("generate the language assessment", exc)


@router.post("/fib/generate", response_model=FIBResponse, status_code=status.HTTP_200_OK)
async def generate_fib(
    request: FIBRequest,
    service: LanguageTesterService = Depends(get_language_tester_service),
    _: str = Depends(verify_api_key),
) -> FIBResponse:
    """
    Creates 'Fill in the Blank' questions based on CEFR level and scenario.

    Args:
        request (FIBRequest): The validated request schema.
        service (LanguageTesterService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        FIBResponse: The generated questions.

    Raises:
        LanguageTesterProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate_fib_questions(request)
    except GenerationError as exc:
        _raise_processing_error("generate the fill-in-the-blank questions", exc)


@router.post("/fib/evaluate", response_model=EvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_fib(
    request: EvaluationRequest,
    service: LanguageTesterService = Depends(get_language_tester_service),
    _: str = Depends(verify_api_key),
) -> EvaluationResponse:
    """
    Evaluates a user's answer for typos, correctness, and grammar.

    Args:
        request (EvaluationRequest): The validated request schema.
        service (LanguageTesterService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        EvaluationResponse: The verdict and feedback.

    Raises:
        LanguageTesterProcessingError: If the evaluation pipeline fails.
    """
    try:
        return service.evaluate_answer(request)
    except GenerationError as exc:
        _raise_processing_error("evaluate the answer", exc)


@router.post("/translation/challenge", response_model=TranslationChallengeResponse, status_code=status.HTTP_200_OK)
async def create_translation_challenge(
    request: TranslationChallengeRequest,
    service: LanguageTesterService = Depends(get_language_tester_service),
    _: str = Depends(verify_api_key),
) -> TranslationChallengeResponse:
    """
    Generates an Active or Passive translation challenge.

    Args:
        request (TranslationChallengeRequest): The validated request schema.
        service (LanguageTesterService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        TranslationChallengeResponse: The generated challenge.

    Raises:
        LanguageTesterProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate_translation_task(request)
    except GenerationError as exc:
        _raise_processing_error("generate the translation challenge", exc)


@router.post("/roleplay/continue", response_model=RoleplayResponse, status_code=status.HTTP_200_OK)
async def chat_roleplay(
    request: RoleplayRequest,
    service: LanguageTesterService = Depends(get_language_tester_service),
    _: str = Depends(verify_api_key),
) -> RoleplayResponse:
    """
    Processes the latest user message in a conversational roleplay, providing
    grammatical feedback and the AI's next line in character.

    Args:
        request (RoleplayRequest): The validated request schema.
        service (LanguageTesterService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        RoleplayResponse: The critique, score, and AI's next line.

    Raises:
        LanguageTesterProcessingError: If the roleplay pipeline fails.
    """
    try:
        return service.continue_roleplay(request)
    except GenerationError as exc:
        _raise_processing_error("continue the roleplay", exc)
