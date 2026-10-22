import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from learning.skill_architect.dependencies import get_skill_architect_service
from learning.skill_architect.schemas import SkillArchitectRequest, SkillArchitectResponse
from learning.skill_architect.services import GenerationError, SkillArchitectError, SkillArchitectService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/skill_architect", tags=["Skill Architect"])


class SkillArchitectHTTPError(HTTPException):
    """Base HTTP exception for the skill architect module."""


class SkillArchitectProcessingError(SkillArchitectHTTPError):
    """Raised when the skill tree generation pipeline fails."""


def _raise_processing_error(action: str, exc: SkillArchitectError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (SkillArchitectError): The domain exception that caused the failure.

    Raises:
        SkillArchitectProcessingError: Always.
    """
    logger.error("Skill architect failed to %s: %s", action, exc)
    raise SkillArchitectProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=SkillArchitectResponse, status_code=status.HTTP_200_OK)
async def generate_skill_tree(
    payload: SkillArchitectRequest,
    service: SkillArchitectService = Depends(get_skill_architect_service),
    _: str = Depends(verify_api_key),
) -> SkillArchitectResponse:
    """
    Deconstructs a domain into a strict, level-wise root-skill progression tree.

    Args:
        payload (SkillArchitectRequest): The validated request schema.
        service (SkillArchitectService): Injected service layer.
        _: API key guard dependency.

    Returns:
        SkillArchitectResponse: The core philosophy and structured skill tree.

    Raises:
        SkillArchitectProcessingError: If the skill tree generation pipeline fails.
    """
    try:
        return await service.generate_skill_tree(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the root-skill tree", exc)
