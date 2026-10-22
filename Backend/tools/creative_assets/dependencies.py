import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_creative_asset_service", "verify_api_key"]


def get_creative_asset_service() -> Iterator["CreativeAssetService"]:
    """
    Dependency provider for CreativeAssetService.

    Yields:
        CreativeAssetService: An initialized service instance.
    """
    from tools.creative_assets.services import CreativeAssetService

    yield CreativeAssetService()
