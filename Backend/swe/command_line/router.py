import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from swe.command_line.dependencies import get_command_line_service, verify_api_key
from swe.command_line.schemas import (
    ChallengeGenerationRequest,
    ChallengeGenerationResponse,
    CommandEvaluationRequest,
    CommandEvaluationResponse,
    CommandExplanationRequest,
    CommandExplanationResponse,
    CommandHintRequest,
    CommandHintResponse,
    CommandOptimizationRequest,
    CommandOptimizationResponse,
    ErrorDiagnosisRequest,
    ErrorDiagnosisResponse,
    PipelineDesignRequest,
    PipelineDesignResponse,
    ShellScriptEvaluationRequest,
    ShellScriptEvaluationResponse,
)
from swe.command_line.services import CommandLineService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/command-line",
    tags=["Command Line"],
    dependencies=[Depends(verify_api_key)],
)


class CommandLineHTTPError(HTTPException):
    """Base HTTP exception for the command line module."""


class CommandLineProcessingError(CommandLineHTTPError):
    """Raised when the command line pipeline fails to produce a result."""


def _raise_generation_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        CommandLineProcessingError: Always, with a 500 status code.
    """
    logger.error("Command line module failed to produce a result: %s", exc)
    raise CommandLineProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate the command line result.",
    )


@router.post("/challenges/generate", response_model=ChallengeGenerationResponse, status_code=status.HTTP_200_OK)
async def generate_challenge(
    payload: ChallengeGenerationRequest,
    service: CommandLineService = Depends(get_command_line_service),
) -> ChallengeGenerationResponse:
    """
    Generates a CLI challenge with a simulated starting file system.

    Args:
        payload: The challenge generation request.
        service: Injected command line service.

    Returns:
        ChallengeGenerationResponse: The generated challenge.

    Raises:
        CommandLineProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_challenge(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/commands/evaluate", response_model=CommandEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_command(
    payload: CommandEvaluationRequest,
    service: CommandLineService = Depends(get_command_line_service),
) -> CommandEvaluationResponse:
    """
    Judges a user's command against a challenge.

    Args:
        payload: The command evaluation request.
        service: Injected command line service.

    Returns:
        CommandEvaluationResponse: The verdict, score, and breakdown.

    Raises:
        CommandLineProcessingError: If the evaluation pipeline fails.
    """
    try:
        return await service.evaluate_command(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/hints/generate", response_model=CommandHintResponse, status_code=status.HTTP_200_OK)
async def generate_hint(
    payload: CommandHintRequest,
    service: CommandLineService = Depends(get_command_line_service),
) -> CommandHintResponse:
    """
    Produces a progressive CLI hint without giving away the full command.

    Args:
        payload: The hint request.
        service: Injected command line service.

    Returns:
        CommandHintResponse: The hint and supporting guidance.

    Raises:
        CommandLineProcessingError: If the hint pipeline fails.
    """
    try:
        return await service.generate_hint(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/pipelines/design", response_model=PipelineDesignResponse, status_code=status.HTTP_200_OK)
async def design_pipeline(
    payload: PipelineDesignRequest,
    service: CommandLineService = Depends(get_command_line_service),
) -> PipelineDesignResponse:
    """
    Breaks down a multi-command pipeline and suggests improvements.

    Args:
        payload: The pipeline design request.
        service: Injected command line service.

    Returns:
        PipelineDesignResponse: The stage breakdown and improved pipeline.

    Raises:
        CommandLineProcessingError: If the pipeline analysis fails.
    """
    try:
        return await service.design_pipeline(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/scripts/evaluate", response_model=ShellScriptEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_script(
    payload: ShellScriptEvaluationRequest,
    service: CommandLineService = Depends(get_command_line_service),
) -> ShellScriptEvaluationResponse:
    """
    Reviews a shell script for correctness, robustness, and security.

    Args:
        payload: The shell script evaluation request.
        service: Injected command line service.

    Returns:
        ShellScriptEvaluationResponse: The scores, issues, and improved script.

    Raises:
        CommandLineProcessingError: If the script review fails.
    """
    try:
        return await service.evaluate_script(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/commands/explain", response_model=CommandExplanationResponse, status_code=status.HTTP_200_OK)
async def explain_command(
    payload: CommandExplanationRequest,
    service: CommandLineService = Depends(get_command_line_service),
) -> CommandExplanationResponse:
    """
    Explains each component of a command or pipeline.

    Args:
        payload: The command explanation request.
        service: Injected command line service.

    Returns:
        CommandExplanationResponse: The breakdown and related commands.

    Raises:
        CommandLineProcessingError: If the explanation pipeline fails.
    """
    try:
        return await service.explain_command(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/errors/diagnose", response_model=ErrorDiagnosisResponse, status_code=status.HTTP_200_OK)
async def diagnose_error(
    payload: ErrorDiagnosisRequest,
    service: CommandLineService = Depends(get_command_line_service),
) -> ErrorDiagnosisResponse:
    """
    Diagnoses the root cause of a command error and suggests a fix.

    Args:
        payload: The error diagnosis request.
        service: Injected command line service.

    Returns:
        ErrorDiagnosisResponse: The diagnosis and corrected command.

    Raises:
        CommandLineProcessingError: If the diagnosis pipeline fails.
    """
    try:
        return await service.diagnose_error(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)


@router.post("/commands/optimize", response_model=CommandOptimizationResponse, status_code=status.HTTP_200_OK)
async def optimize_command(
    payload: CommandOptimizationRequest,
    service: CommandLineService = Depends(get_command_line_service),
) -> CommandOptimizationResponse:
    """
    Suggests more efficient or idiomatic alternatives to a working command.

    Args:
        payload: The command optimization request.
        service: Injected command line service.

    Returns:
        CommandOptimizationResponse: The optimized command and alternatives.

    Raises:
        CommandLineProcessingError: If the optimization pipeline fails.
    """
    try:
        return await service.optimize_command(payload)
    except GenerationError as exc:
        _raise_generation_error(exc)
