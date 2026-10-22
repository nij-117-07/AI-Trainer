import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from learning.guides.dependencies import get_guide_service, verify_api_key
from learning.guides.schemas import (
    DailyPlannerRequest,
    DailyPlannerResponse,
    GuideRequest,
    GuideResponse,
    ProjectArchitectRequest,
    ProjectArchitectResponse,
    ProjectSuggestorRequest,
    ProjectSuggestorResponse,
    WhatToLearnRequest,
    WhatToLearnResponse,
)
from learning.guides.services import GenerationError, GuideService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/guides", tags=["Guides"])


class GuidesHTTPError(HTTPException):
    """Base HTTP exception for the guides module."""


class GuidesProcessingError(GuidesHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        GuidesProcessingError: Always.
    """
    logger.error("Guides failed to %s: %s", action, exc)
    raise GuidesProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/task", response_model=GuideResponse, status_code=status.HTTP_200_OK)
async def create_learning_guide(
    payload: GuideRequest,
    service: GuideService = Depends(get_guide_service),
    _: str = Depends(verify_api_key),
) -> GuideResponse:
    """
    Generates a customized learning guide based on skill level and goals.

    Args:
        payload (GuideRequest): The validated request schema.
        service (GuideService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        GuideResponse: The mentor feedback and task list.

    Raises:
        GuidesProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_guide(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the learning guide", exc)


@router.post("/daily-plan", response_model=DailyPlannerResponse, status_code=status.HTTP_200_OK)
async def create_daily_plan(
    payload: DailyPlannerRequest,
    service: GuideService = Depends(get_guide_service),
    _: str = Depends(verify_api_key),
) -> DailyPlannerResponse:
    """
    Generates a detailed daily study plan with roadmap, gap analysis, and exercises.

    Args:
        payload (DailyPlannerRequest): The validated request schema.
        service (GuideService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        DailyPlannerResponse: The structured daily plan.

    Raises:
        GuidesProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_daily_plan(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the daily plan", exc)


@router.post("/project-blueprint", response_model=ProjectArchitectResponse, status_code=status.HTTP_200_OK)
async def create_project_blueprint(
    payload: ProjectArchitectRequest,
    service: GuideService = Depends(get_guide_service),
    _: str = Depends(verify_api_key),
) -> ProjectArchitectResponse:
    """
    Generates a unique, industry-specific project blueprint to achieve mastery.

    Args:
        payload (ProjectArchitectRequest): The validated request schema.
        service (GuideService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        ProjectArchitectResponse: The generated project blueprint.

    Raises:
        GuidesProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.generate_unique_project(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the project blueprint", exc)


@router.post("/suggest-topics", response_model=WhatToLearnResponse, status_code=status.HTTP_200_OK)
async def get_next_learning_topics(
    payload: WhatToLearnRequest,
    service: GuideService = Depends(get_guide_service),
    _: str = Depends(verify_api_key),
) -> WhatToLearnResponse:
    """
    Recommends next topics while avoiding previously suggested content.

    Args:
        payload (WhatToLearnRequest): The validated request schema.
        service (GuideService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        WhatToLearnResponse: The recommended topics.

    Raises:
        GuidesProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.suggest_next_topics(payload)
    except GenerationError as exc:
        _raise_processing_error("suggest the next topics", exc)


@router.post("/suggest-projects", response_model=ProjectSuggestorResponse, status_code=status.HTTP_200_OK)
async def suggest_industry_projects(
    payload: ProjectSuggestorRequest,
    service: GuideService = Depends(get_guide_service),
    _: str = Depends(verify_api_key),
) -> ProjectSuggestorResponse:
    """
    Generates strategic project use cases for a specific topic and industry.

    Args:
        payload (ProjectSuggestorRequest): The validated request schema.
        service (GuideService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        ProjectSuggestorResponse: The strategy and project list.

    Raises:
        GuidesProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.suggest_projects(payload)
    except GenerationError as exc:
        _raise_processing_error("suggest the industry projects", exc)
