import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_lesson_service", "verify_api_key"]


def get_lesson_service() -> Iterator["LessonService"]:
    """
    Dependency provider for LessonService.

    Yields:
        LessonService: An initialized service instance.
    """
    from linguistic.lesson.services import LessonService

    yield LessonService()
