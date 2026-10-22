import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from learning.projects.dependencies import get_project_recommender_service
from learning.projects.schemas import ProjectRecommenderRequest, ProjectRecommenderResponse
from learning.projects.services import GenerationError, ProjectRecommenderService, ProjectsError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["Project Recommender"])


class ProjectsHTTPError(HTTPException):
    """Base HTTP exception for the projects module."""


class ProjectsProcessingError(ProjectsHTTPError):
    """Raised when the project recommendation pipeline fails."""


def _raise_processing_error(action: str, exc: ProjectsError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (ProjectsError): The domain exception that caused the failure.

    Raises:
        ProjectsProcessingError: Always.
    """
    logger.error("Projects failed to %s: %s", action, exc)
    raise ProjectsProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=ProjectRecommenderResponse, status_code=status.HTTP_200_OK)
async def generate_project_recommendations(
    payload: ProjectRecommenderRequest,
    service: ProjectRecommenderService = Depends(get_project_recommender_service),
    _: str = Depends(verify_api_key),
) -> ProjectRecommenderResponse:
    """
    Recommends hands-on projects to help a learner master a topic.

    Args:
        payload (ProjectRecommenderRequest): The validated request schema.
        service (ProjectRecommenderService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        ProjectRecommenderResponse: The recommended projects and advice.

    Raises:
        ProjectsProcessingError: If the recommendation pipeline fails.
    """
    try:
        return service.generate(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the project recommendations", exc)
