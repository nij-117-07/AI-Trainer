import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from learning.resource_suggestor.dependencies import get_resource_suggest_service
from learning.resource_suggestor.schemas import ResourceSuggestRequest, ResourceSuggestResponse
from learning.resource_suggestor.services import GenerationError, ResourceSuggestError, ResourceSuggestService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resource_suggestor", tags=["Resource Suggestor"])


class ResourceSuggestHTTPError(HTTPException):
    """Base HTTP exception for the resource suggestor module."""


class ResourceSuggestProcessingError(ResourceSuggestHTTPError):
    """Raised when the resource suggestion pipeline fails to produce a response."""


def _raise_processing_error(exc: ResourceSuggestError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc: The domain exception that caused the failure.

    Raises:
        ResourceSuggestProcessingError: Always.
    """
    logger.error("Resource suggestion failed: %s", exc)
    raise ResourceSuggestProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to generate resource suggestions.",
    )


@router.post("/suggest", response_model=ResourceSuggestResponse, status_code=status.HTTP_200_OK)
async def suggest_resources(
    payload: ResourceSuggestRequest,
    service: ResourceSuggestService = Depends(get_resource_suggest_service),
    _: str = Depends(verify_api_key),
) -> ResourceSuggestResponse:
    """
    Generates personalized learning resource recommendations.

    Analyzes the learner's background and target topic, then returns a curated
    list of resources with a learning path summary and next steps.

    Args:
        payload: The validated resource suggestion request.
        service: Injected service layer.
        _: API key guard dependency.

    Returns:
        Learning path summary, recommended resources, and next steps.

    Raises:
        ResourceSuggestProcessingError: If the suggestion pipeline fails.
    """
    try:
        return await service.suggest(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
