import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from tools.creative_assets.dependencies import get_creative_asset_service
from tools.creative_assets.schemas import CreativeAssetRequest, CreativeAssetResponse
from tools.creative_assets.services import CreativeAssetsError, CreativeAssetService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/creative_assets", tags=["Creative Assets"])


class CreativeAssetHTTPError(HTTPException):
    """Base HTTP exception for the creative_assets module."""


class CreativeAssetProcessingError(CreativeAssetHTTPError):
    """Raised when the creative asset generation pipeline fails."""


def _raise_processing_error(action: str, exc: CreativeAssetsError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (CreativeAssetsError): The domain exception that caused the failure.

    Raises:
        CreativeAssetProcessingError: Always.
    """
    logger.error("Creative assets failed to %s: %s", action, exc)
    raise CreativeAssetProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=CreativeAssetResponse, status_code=status.HTTP_200_OK)
async def generate_creative_assets(
    payload: CreativeAssetRequest,
    service: CreativeAssetService = Depends(get_creative_asset_service),
    _: str = Depends(verify_api_key),
) -> CreativeAssetResponse:
    """
    Generates high-impact creative assets (names, hashtags, slogans, SEO titles).

    Args:
        payload (CreativeAssetRequest): The validated request schema.
        service (CreativeAssetService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        CreativeAssetResponse: The generated suggestions with explanations.

    Raises:
        CreativeAssetProcessingError: If the generation pipeline fails.
    """
    try:
        return service.generate(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the creative assets", exc)
