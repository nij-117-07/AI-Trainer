import logging
from typing import List, NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from linguistic.simulator.dependencies import get_chat_service, get_simulation_service
from linguistic.simulator.schemas import (
    ChatRequest,
    ChatResponse,
    PromptCreate,
    PromptDetail,
    PromptUpdate,
    SimulationRequest,
    SimulationResponse,
)
from linguistic.simulator.services import (
    GenerationError,
    PromptManager,
    PromptNotFoundError,
    SimulatorError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/simulator", tags=["Behavioral Simulation"])


class SimulatorHTTPError(HTTPException):
    """Base HTTP exception for the simulator module."""


class SimulatorProcessingError(SimulatorHTTPError):
    """Raised when the simulation pipeline fails to produce content."""


class PromptNotFoundHTTPError(SimulatorHTTPError):
    """Raised when a requested simulator prompt does not exist."""


def _raise_simulation_error(action: str, exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        SimulatorProcessingError: Always.
    """
    logger.error("Simulator failed to %s: %s", action, exc)
    raise SimulatorProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


def _raise_prompt_error(exc: SimulatorError) -> NoReturn:
    """
    Maps a prompt domain exception to the matching module-level HTTP error.

    Args:
        exc (SimulatorError): The domain exception that caused the failure.

    Raises:
        PromptNotFoundHTTPError: For missing prompts.
        SimulatorProcessingError: For any other storage failure.
    """
    if isinstance(exc, PromptNotFoundError):
        logger.warning("Simulator prompt not found: %s", exc)
        raise PromptNotFoundHTTPError(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )
    logger.error("Simulator prompt storage failure: %s", exc)
    raise SimulatorProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Simulator storage error",
    )


@router.post("/run", response_model=SimulationResponse, status_code=status.HTTP_200_OK)
async def create_simulation(
    payload: SimulationRequest,
    service: "SimulationService" = Depends(get_simulation_service),
    _: str = Depends(verify_api_key),
) -> SimulationResponse:
    """
    Triggers a new behavioral simulation based on persona and scenario.

    Args:
        payload (SimulationRequest): The validated request schema.
        service (SimulationService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        SimulationResponse: The simulation results.

    Raises:
        SimulatorProcessingError: If the simulation pipeline fails.
    """
    try:
        return SimulationResponse(**service.run_behavioral_sim(payload))
    except GenerationError as exc:
        _raise_simulation_error("run the simulation", exc)


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def continue_chat(
    payload: ChatRequest,
    service: "ChatService" = Depends(get_chat_service),
    _: str = Depends(verify_api_key),
) -> ChatResponse:
    """
    Maintains a situational conversation turn.

    Args:
        payload (ChatRequest): The validated request schema.
        service (ChatService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        ChatResponse: The thought, dialogue, and updated history.

    Raises:
        SimulatorProcessingError: If the chat pipeline fails.
    """
    try:
        return ChatResponse(**service.execute_chat(payload))
    except GenerationError as exc:
        _raise_simulation_error("continue the chat", exc)


@router.get("/prompts", response_model=List[str], status_code=status.HTTP_200_OK)
async def list_prompts(
    _: str = Depends(verify_api_key),
) -> List[str]:
    """
    Lists all available simulator prompt names.

    Args:
        _ (str): API key guard dependency.

    Returns:
        List[str]: The stored prompt names.
    """
    return PromptManager.list_names()


@router.post("/prompts", status_code=status.HTTP_201_CREATED)
async def create_prompt(
    payload: PromptCreate,
    _: str = Depends(verify_api_key),
) -> dict:
    """
    Creates a new system prompt.

    Args:
        payload (PromptCreate): The prompt name and content.
        _ (str): API key guard dependency.

    Returns:
        dict: A confirmation message.
    """
    PromptManager.save_prompt(payload.name, payload.content)
    return {"message": f"Prompt '{payload.name}' created."}


@router.get("/prompts/{name}", response_model=PromptDetail, status_code=status.HTTP_200_OK)
async def view_prompt(
    name: str,
    _: str = Depends(verify_api_key),
) -> PromptDetail:
    """
    Views a specific prompt's content.

    Args:
        name (str): The prompt identifier.
        _ (str): API key guard dependency.

    Returns:
        PromptDetail: The prompt name and content.

    Raises:
        PromptNotFoundHTTPError: If the prompt does not exist.
    """
    try:
        content = PromptManager.get_prompt(name)
        return PromptDetail(name=name, content=content)
    except SimulatorError as exc:
        _raise_prompt_error(exc)


@router.put("/prompts/{name}", status_code=status.HTTP_200_OK)
async def update_prompt(
    name: str,
    payload: PromptUpdate,
    _: str = Depends(verify_api_key),
) -> dict:
    """
    Updates an existing prompt's content.

    Args:
        name (str): The prompt identifier.
        payload (PromptUpdate): The new prompt content.
        _ (str): API key guard dependency.

    Returns:
        dict: A confirmation message.

    Raises:
        PromptNotFoundHTTPError: If the prompt does not exist.
    """
    try:
        PromptManager.get_prompt(name)
    except SimulatorError as exc:
        _raise_prompt_error(exc)
    PromptManager.save_prompt(name, payload.content)
    return {"message": f"Prompt '{name}' updated."}
