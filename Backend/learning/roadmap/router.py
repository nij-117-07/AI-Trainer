import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from learning.roadmap.dependencies import get_roadmap_service
from learning.roadmap.schemas import RoadmapRequest, RoadmapResponse, SubtopicRequest, SubtopicResponse
from learning.roadmap.services import RoadmapError, RoadmapService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/roadmap", tags=["Roadmap Generator"])


class RoadmapHTTPError(HTTPException):
    """Base HTTP exception for the roadmap module."""


class RoadmapProcessingError(RoadmapHTTPError):
    """Raised when the roadmap pipeline fails to generate content."""


def _raise_processing_error(action: str, exc: RoadmapError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (RoadmapError): The domain exception that caused the failure.

    Raises:
        RoadmapProcessingError: Always.
    """
    logger.error("Roadmap failed to %s: %s", action, exc)
    raise RoadmapProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=RoadmapResponse, status_code=status.HTTP_200_OK)
async def generate_learning_roadmap(
    payload: RoadmapRequest,
    service: RoadmapService = Depends(get_roadmap_service),
    _: str = Depends(verify_api_key),
) -> RoadmapResponse:
    """
    Takes user input (subject, levels, style) and returns a generated AI
    persona prompt and a list of main topics.

    Args:
        payload (RoadmapRequest): The validated request schema.
        service (RoadmapService): Injected service layer.

    Returns:
        RoadmapResponse: The generated persona and main topics.

    Raises:
        RoadmapProcessingError: If the underlying pipeline fails.
    """
    try:
        persona, topics = await service.generate_roadmap_data(payload)
        return RoadmapResponse(
            generated_persona_prompt=persona,
            main_topics=topics,
        )
    except RoadmapError as exc:
        _raise_processing_error("generate the learning roadmap", exc)


@router.post("/expand-topic", response_model=SubtopicResponse, status_code=status.HTTP_200_OK)
async def expand_roadmap_topic(
    payload: SubtopicRequest,
    service: RoadmapService = Depends(get_roadmap_service),
    _: str = Depends(verify_api_key),
) -> SubtopicResponse:
    """
    Generates deep-dive subtopics and a milestone for a specific module.

    Args:
        payload (SubtopicRequest): The validated request schema.
        service (RoadmapService): Injected service layer.

    Returns:
        SubtopicResponse: The expanded subtopics and milestone.

    Raises:
        RoadmapProcessingError: If the underlying pipeline fails.
    """
    try:
        result = await service.generate_subtopics(payload)
        return SubtopicResponse(**result)
    except RoadmapError as exc:
        _raise_processing_error("expand the roadmap topic", exc)
