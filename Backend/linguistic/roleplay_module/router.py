import logging
from typing import List, NoReturn

from fastapi import APIRouter, Depends, HTTPException, Response, status

from core.security import verify_api_key
from linguistic.roleplay_module.dependencies import get_roleplay_service, get_roleplay_storage_service
from linguistic.roleplay_module.schemas import RoleplayRecord, RoleplayRequest, RoleplayResponse, RoleplayUpdate
from linguistic.roleplay_module.services import (
    GenerationError,
    RoleplayError,
    RoleplayExistsError,
    RoleplayNotFoundError,
    RoleplayService,
    RoleplayStorageService,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/roleplay_module", tags=["Roleplay AI"])


class RoleplayHTTPError(HTTPException):
    """Base HTTP exception for the roleplay_module module."""


class RoleplayProcessingError(RoleplayHTTPError):
    """Raised when the roleplay pipeline fails to produce a response."""


class RoleplayNotFoundHTTPError(RoleplayHTTPError):
    """Raised when a requested roleplay persona does not exist."""


class RoleplayExistsHTTPError(RoleplayHTTPError):
    """Raised when a roleplay persona already exists."""


def _raise_roleplay_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        RoleplayProcessingError: Always.
    """
    logger.error("Roleplay engine failed to process request: %s", exc)
    raise RoleplayProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to process the roleplay request.",
    )


def _raise_storage_error(exc: Exception) -> NoReturn:
    """
    Maps a storage domain exception to the matching module-level HTTP error.

    Args:
        exc (Exception): The domain exception that caused the failure.

    Raises:
        RoleplayNotFoundHTTPError: For missing personas.
        RoleplayExistsHTTPError: For duplicate personas.
        RoleplayProcessingError: For any other storage failure.
    """
    if isinstance(exc, RoleplayNotFoundError):
        logger.warning("Roleplay persona not found: %s", exc)
        raise RoleplayNotFoundHTTPError(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    if isinstance(exc, RoleplayExistsError):
        logger.warning("Roleplay persona already exists: %s", exc)
        raise RoleplayExistsHTTPError(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role already exists",
        )
    logger.error("Roleplay storage failure: %s", exc)
    raise RoleplayProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Roleplay storage error",
    )


@router.post("/chat", response_model=RoleplayResponse, status_code=status.HTTP_200_OK)
async def chat_interaction(
    request_data: RoleplayRequest,
    service: RoleplayService = Depends(get_roleplay_service),
    _: str = Depends(verify_api_key),
) -> RoleplayResponse:
    """
    Interacts with the Roleplay Chatbot using the request's system prompt.

    Args:
        request_data (RoleplayRequest): The validated request schema.
        service (RoleplayService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        RoleplayResponse: The AI's in-character response.

    Raises:
        RoleplayProcessingError: If the roleplay pipeline fails.
    """
    try:
        response = service.generate_response(request_data)
        return RoleplayResponse(response_message=response)
    except GenerationError as exc:
        _raise_roleplay_error(exc)


@router.post("/chat/stored/{name}", response_model=RoleplayResponse, status_code=status.HTTP_200_OK)
async def chat_with_stored_role(
    name: str,
    request: RoleplayRequest,
    ai_service: RoleplayService = Depends(get_roleplay_service),
    storage: RoleplayStorageService = Depends(get_roleplay_storage_service),
    _: str = Depends(verify_api_key),
) -> RoleplayResponse:
    """
    Chats using a pre-saved persona from YAML, overriding the request prompt.

    Args:
        name (str): The stored persona name.
        request (RoleplayRequest): The validated request schema.
        ai_service (RoleplayService): Injected service layer.
        storage (RoleplayStorageService): Injected storage service.
        _ (str): API key guard dependency.

    Returns:
        RoleplayResponse: The AI's in-character response.

    Raises:
        RoleplayNotFoundHTTPError: If the persona does not exist.
        RoleplayProcessingError: If the roleplay pipeline fails.
    """
    try:
        stored_role = storage.get_role(name)
    except RoleplayError as exc:
        _raise_storage_error(exc)

    try:
        response = ai_service.generate_response(request, persona_prompt=stored_role.prompt)
        return RoleplayResponse(response_message=response)
    except GenerationError as exc:
        _raise_roleplay_error(exc)


@router.post("/roles", response_model=RoleplayRecord, status_code=status.HTTP_201_CREATED)
async def create_role(
    role: RoleplayRecord,
    storage: RoleplayStorageService = Depends(get_roleplay_storage_service),
    _: str = Depends(verify_api_key),
) -> RoleplayRecord:
    """
    Creates a new roleplay YAML file.

    Args:
        role (RoleplayRecord): The persona to create.
        storage (RoleplayStorageService): Injected storage service.
        _ (str): API key guard dependency.

    Returns:
        RoleplayRecord: The persisted persona.

    Raises:
        RoleplayExistsHTTPError: If the persona already exists.
    """
    try:
        return storage.create_role(role)
    except RoleplayError as exc:
        _raise_storage_error(exc)


@router.get("/roles", response_model=List[str], status_code=status.HTTP_200_OK)
async def list_roles(
    storage: RoleplayStorageService = Depends(get_roleplay_storage_service),
    _: str = Depends(verify_api_key),
) -> List[str]:
    """
    Lists all available role names.

    Args:
        storage (RoleplayStorageService): Injected storage service.
        _ (str): API key guard dependency.

    Returns:
        List[str]: The stored persona names.
    """
    return storage.list_roles()


@router.get("/roles/{name}", response_model=RoleplayRecord, status_code=status.HTTP_200_OK)
async def get_role(
    name: str,
    storage: RoleplayStorageService = Depends(get_roleplay_storage_service),
    _: str = Depends(verify_api_key),
) -> RoleplayRecord:
    """
    Gets the system prompt for a specific role.

    Args:
        name (str): The persona name.
        storage (RoleplayStorageService): Injected storage service.
        _ (str): API key guard dependency.

    Returns:
        RoleplayRecord: The stored persona.

    Raises:
        RoleplayNotFoundHTTPError: If the persona does not exist.
    """
    try:
        return storage.get_role(name)
    except RoleplayError as exc:
        _raise_storage_error(exc)


@router.patch("/roles/{name}", response_model=RoleplayRecord, status_code=status.HTTP_200_OK)
async def update_role(
    name: str,
    update: RoleplayUpdate,
    storage: RoleplayStorageService = Depends(get_roleplay_storage_service),
    _: str = Depends(verify_api_key),
) -> RoleplayRecord:
    """
    Updates the prompt for an existing role.

    Args:
        name (str): The persona name.
        update (RoleplayUpdate): The new persona prompt.
        storage (RoleplayStorageService): Injected storage service.
        _ (str): API key guard dependency.

    Returns:
        RoleplayRecord: The updated persona.

    Raises:
        RoleplayNotFoundHTTPError: If the persona does not exist.
    """
    try:
        return storage.update_role(name, update.prompt)
    except RoleplayError as exc:
        _raise_storage_error(exc)


@router.delete("/roles/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    name: str,
    storage: RoleplayStorageService = Depends(get_roleplay_storage_service),
    _: str = Depends(verify_api_key),
) -> Response:
    """
    Deletes a roleplay YAML file.

    Args:
        name (str): The persona name.
        storage (RoleplayStorageService): Injected storage service.
        _ (str): API key guard dependency.

    Returns:
        Response: Empty 204 response.

    Raises:
        RoleplayNotFoundHTTPError: If the persona does not exist.
    """
    try:
        storage.delete_role(name)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except RoleplayError as exc:
        _raise_storage_error(exc)
