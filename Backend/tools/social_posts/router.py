import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from tools.social_posts.dependencies import get_social_post_service
from tools.social_posts.schemas import SocialPostRequest, SocialPostResponse
from tools.social_posts.services import GenerationError, SocialPostService, SocialPostsError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/social_posts", tags=["Social Media Post Generator"])


class SocialPostHTTPError(HTTPException):
    """Base HTTP exception for the social_posts module."""


class SocialPostProcessingError(SocialPostHTTPError):
    """Raised when the social post generation pipeline fails."""


def _raise_processing_error(action: str, exc: SocialPostsError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (SocialPostsError): The domain exception that caused the failure.

    Raises:
        SocialPostProcessingError: Always.
    """
    logger.error("Social posts failed to %s: %s", action, exc)
    raise SocialPostProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=SocialPostResponse, status_code=status.HTTP_200_OK)
async def generate_social_posts(
    payload: SocialPostRequest,
    service: SocialPostService = Depends(get_social_post_service),
    _: str = Depends(verify_api_key),
) -> SocialPostResponse:
    """
    Generates platform-specific social media post suggestions.

    Args:
        payload (SocialPostRequest): The validated request schema.
        service (SocialPostService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        SocialPostResponse: The strategy message and generated post variants.

    Raises:
        SocialPostProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the social media posts", exc)
