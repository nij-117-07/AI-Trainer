import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from tools.prompt_generator.dependencies import get_persona_manager
from tools.prompt_generator.schemas import PersonaCreate, PersonaResponse
from tools.prompt_generator.services import GenerationError, PersonaError, PersonaManager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/prompt_generator", tags=["Persona Generation"])


class PersonaHTTPError(HTTPException):
    """Base HTTP exception for the prompt_generator module."""


class PersonaProcessingError(PersonaHTTPError):
    """Raised when the persona generation pipeline fails."""


def _raise_processing_error(action: str, exc: PersonaError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (PersonaError): The domain exception that caused the failure.

    Raises:
        PersonaProcessingError: Always.
    """
    logger.error("Prompt generator failed to %s: %s", action, exc)
    raise PersonaProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=PersonaResponse, status_code=status.HTTP_200_OK)
async def generate_persona(
    payload: PersonaCreate,
    service: PersonaManager = Depends(get_persona_manager),
    _: str = Depends(verify_api_key),
) -> PersonaResponse:
    """
    Generates or refines an LLM System Persona.

    Supports iterative improvement by passing a previous prompt in
    'past_prompt', and deterministic replication via 'seed'.

    Args:
        payload (PersonaCreate): The validated request schema.
        service (PersonaManager): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        PersonaResponse: The persona name, generated system prompt, and seed used.

    Raises:
        PersonaProcessingError: If the persona generation pipeline fails.
    """
    try:
        return service.generate(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the persona", exc)
