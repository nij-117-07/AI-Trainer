import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_roleplay_service", "get_roleplay_storage_service", "verify_api_key"]


def get_roleplay_service() -> Iterator["RoleplayService"]:
    """
    Dependency provider for RoleplayService.

    Yields:
        RoleplayService: An initialized service instance.
    """
    from linguistic.roleplay_module.services import RoleplayService

    yield RoleplayService()


def get_roleplay_storage_service() -> Iterator["RoleplayStorageService"]:
    """
    Dependency provider for RoleplayStorageService.

    Yields:
        RoleplayStorageService: An initialized storage service instance.
    """
    from linguistic.roleplay_module.services import RoleplayStorageService

    yield RoleplayStorageService()
