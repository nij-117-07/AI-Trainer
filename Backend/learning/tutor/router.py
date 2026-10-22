import logging
from typing import List, NoReturn

from fastapi import APIRouter, Depends, HTTPException, Response, status

from learning.tutor.dependencies import get_prompt_service, get_tutor_service, verify_api_key
from learning.tutor.schemas import PromptActionResponse, PromptCreateUpdate, PromptResponse, TutorRequest, TutorResponse
from learning.tutor.services import (
    GenerationError,
    PromptError,
    PromptNotFoundError,
    PromptService,
    TutorService,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tutor", tags=["Adaptive Tutor"])


class TutorHTTPError(HTTPException):
    """Base HTTP exception for the tutor module."""


class TutorProcessingError(TutorHTTPError):
    """Raised when the tutoring pipeline fails to generate a response."""


class PromptNotFoundHTTPError(TutorHTTPError):
    """Raised when a requested prompt template does not exist."""


class PromptStorageHTTPError(TutorHTTPError):
    """Raised when a prompt template cannot be read or written."""


def _raise_tutor_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        TutorProcessingError: Always.
    """
    logger.error("Tutor engine failed to process request: %s", exc)
    raise TutorProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Tutor engine failed to process the request.",
    )


def _raise_prompt_error(exc: PromptError) -> NoReturn:
    """
    Maps a prompt domain exception to the matching module-level HTTP error.

    Args:
        exc (PromptError): The domain exception that caused the failure.

    Raises:
        PromptNotFoundHTTPError: For missing prompt templates.
        PromptStorageHTTPError: For storage/parse failures.
    """
    if isinstance(exc, PromptNotFoundError):
        logger.warning("Prompt template not found: %s", exc)
        raise PromptNotFoundHTTPError(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )
    logger.error("Prompt template storage failure: %s", exc)
    raise PromptStorageHTTPError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error accessing prompt file",
    )


@router.post("/explain", response_model=TutorResponse, status_code=status.HTTP_200_OK)
async def explain_concept(
    payload: TutorRequest,
    service: TutorService = Depends(get_tutor_service),
    _: str = Depends(verify_api_key),
) -> TutorResponse:
    """
    Generates an adaptive explanation for a student query.

    Args:
        payload: The validated tutoring request.
        service: Injected tutor service.
        _: API key guard dependency.

    Returns:
        TutorResponse: The adapted explanation, analogy, and feedback.

    Raises:
        TutorProcessingError: If the tutoring pipeline fails.
    """
    try:
        return await service.get_adaptive_response(payload)
    except GenerationError as exc:
        _raise_tutor_error(exc)


@router.post("/prompts", response_model=PromptActionResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    payload: PromptCreateUpdate,
    service: PromptService = Depends(get_prompt_service),
    _: str = Depends(verify_api_key),
) -> PromptActionResponse:
    """
    Creates or updates a prompt template.

    Args:
        payload: The prompt name and content.
        service: Injected prompt service.
        _: API key guard dependency.

    Returns:
        PromptActionResponse: Confirmation message.

    Raises:
        PromptStorageHTTPError: If the template cannot be persisted.
    """
    try:
        name = service.create_or_update_prompt(payload)
        return PromptActionResponse(message=f"Prompt '{name}' created/updated successfully")
    except PromptError as exc:
        _raise_prompt_error(exc)


@router.get("/prompts", response_model=List[str], status_code=status.HTTP_200_OK)
async def list_prompts(
    service: PromptService = Depends(get_prompt_service),
    _: str = Depends(verify_api_key),
) -> List[str]:
    """
    Lists all available prompt template names.

    Args:
        service: Injected prompt service.
        _: API key guard dependency.

    Returns:
        List[str]: Sorted prompt names.
    """
    return service.list_prompts()


@router.get("/prompts/{name}", response_model=PromptResponse, status_code=status.HTTP_200_OK)
async def get_prompt(
    name: str,
    service: PromptService = Depends(get_prompt_service),
    _: str = Depends(verify_api_key),
) -> PromptResponse:
    """
    Retrieves a single prompt template by name.

    Args:
        name: The prompt identifier.
        service: Injected prompt service.
        _: API key guard dependency.

    Returns:
        PromptResponse: The prompt document.

    Raises:
        PromptNotFoundHTTPError: If the prompt does not exist.
    """
    try:
        prompt = service.read_prompt_full(name)
        return PromptResponse(
            name=prompt.name,
            content=prompt.content,
            created_at=prompt.created_at,
            updated_at=prompt.updated_at,
        )
    except PromptError as exc:
        _raise_prompt_error(exc)


@router.put("/prompts/{name}", response_model=PromptActionResponse, status_code=status.HTTP_200_OK)
async def update_prompt(
    name: str,
    payload: PromptCreateUpdate,
    service: PromptService = Depends(get_prompt_service),
    _: str = Depends(verify_api_key),
) -> PromptActionResponse:
    """
    Updates a prompt template.

    Args:
        name: The prompt identifier.
        payload: The prompt name and content.
        service: Injected prompt service.
        _: API key guard dependency.

    Returns:
        PromptActionResponse: Confirmation message.

    Raises:
        PromptStorageHTTPError: If the template cannot be persisted.
    """
    try:
        service.create_or_update_prompt(payload)
        return PromptActionResponse(message=f"Prompt '{name}' updated successfully")
    except PromptError as exc:
        _raise_prompt_error(exc)


@router.delete("/prompts/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(
    name: str,
    service: PromptService = Depends(get_prompt_service),
    _: str = Depends(verify_api_key),
) -> Response:
    """
    Deletes a prompt template.

    Args:
        name: The prompt identifier.
        service: Injected prompt service.
        _: API key guard dependency.

    Returns:
        Response: Empty 204 response.

    Raises:
        PromptNotFoundHTTPError: If the prompt does not exist.
    """
    try:
        service.delete_prompt(name)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except PromptError as exc:
        _raise_prompt_error(exc)
