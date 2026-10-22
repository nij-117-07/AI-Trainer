from fastapi import APIRouter

from assessment.grader.router import router as grader_router

assessment_router = APIRouter(prefix="/assessment")
assessment_router.include_router(grader_router)

__all__ = ["assessment_router"]
