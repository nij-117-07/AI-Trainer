import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_social_post_service", "verify_api_key"]


def get_social_post_service() -> Iterator["SocialPostService"]:
    """
    Dependency provider for SocialPostService.

    Yields:
        SocialPostService: An initialized service instance.
    """
    from tools.social_posts.services import SocialPostService

    yield SocialPostService()
