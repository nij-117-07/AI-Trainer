import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_ingredient_service", "verify_api_key"]


def get_ingredient_service() -> Iterator["IngredientVisionService"]:
    """
    Dependency provider for IngredientVisionService.

    Yields:
        IngredientVisionService: An initialized service instance.
    """
    from tools.ingredients.services import IngredientVisionService

    yield IngredientVisionService()
