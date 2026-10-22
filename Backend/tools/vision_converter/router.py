import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from core.security import verify_api_key
from tools.vision_converter.dependencies import get_vision_service
from tools.vision_converter.schemas import VisionConversionResponse
from tools.vision_converter.services import GenerationError, VisionError, VisionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vision", tags=["Vision Converter"])


class VisionHTTPError(HTTPException):
    """Base HTTP exception for the vision converter module."""


class VisionProcessingError(VisionHTTPError):
    """Raised when the vision conversion pipeline fails."""


def _raise_processing_error(action: str, exc: VisionError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (VisionError): The domain exception that caused the failure.

    Raises:
        VisionProcessingError: Always.
    """
    logger.error("Vision converter failed to %s: %s", action, exc)
    raise VisionProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/convert", response_model=VisionConversionResponse, status_code=status.HTTP_200_OK)
async def convert_image(
    file: UploadFile = File(...),
    instruction: str = Form("Convert the image to markdown."),
    service: VisionService = Depends(get_vision_service),
    _: str = Depends(verify_api_key),
) -> VisionConversionResponse:
    """
    Converts an uploaded image to well-structured Markdown.

    The image is stored, compressed when larger than 1MB, and processed by the
    DSPy vision pipeline.

    Args:
        file (UploadFile): The uploaded image.
        instruction (str): What to extract from the image.
        service (VisionService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        VisionConversionResponse: The converted Markdown output.

    Raises:
        HTTPException: If the uploaded file is not an image.
        VisionProcessingError: If the conversion pipeline fails.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image.",
        )
    content = await file.read()
    try:
        return service.convert_image(content, file.filename or "upload.jpg", instruction)
    except GenerationError as exc:
        _raise_processing_error("convert the image", exc)
