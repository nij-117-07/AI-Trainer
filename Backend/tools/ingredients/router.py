import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from core.security import verify_api_key
from tools.ingredients.dependencies import get_ingredient_service
from tools.ingredients.schemas import IngredientAnalysisResponse
from tools.ingredients.services import GenerationError, IngredientError, IngredientVisionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ingredients", tags=["Ingredients Checker"])


class IngredientHTTPError(HTTPException):
    """Base HTTP exception for the ingredients module."""


class IngredientProcessingError(IngredientHTTPError):
    """Raised when the ingredient analysis pipeline fails."""


def _raise_processing_error(action: str, exc: IngredientError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (IngredientError): The domain exception that caused the failure.

    Raises:
        IngredientProcessingError: Always.
    """
    logger.error("Ingredients failed to %s: %s", action, exc)
    raise IngredientProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/check", response_model=IngredientAnalysisResponse, status_code=status.HTTP_200_OK)
async def check_ingredients(
    file: UploadFile = File(...),
    manual_text: str = Form("", description="Optional text correction of the ingredients"),
    service: IngredientVisionService = Depends(get_ingredient_service),
    _: str = Depends(verify_api_key),
) -> IngredientAnalysisResponse:
    """
    Accepts a photo of a product's ingredients list and returns a health analysis.

    The image is stored, compressed when larger than 1MB, and analyzed by the
    DSPy vision pipeline.

    Args:
        file (UploadFile): The uploaded ingredients image.
        manual_text (str): Optional manual ingredient text correction.
        service (IngredientVisionService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        IngredientAnalysisResponse: The extracted ingredients and health analysis.

    Raises:
        HTTPException: If the uploaded file is not an image.
        IngredientProcessingError: If the analysis pipeline fails.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image.",
        )
    content = await file.read()
    try:
        return service.check_ingredients(content, file.filename or "upload.jpg", manual_text)
    except GenerationError as exc:
        _raise_processing_error("analyze the ingredients", exc)
