import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from tools.flexible_writer.dependencies import get_flexible_writer_service
from tools.flexible_writer.schemas import FlexibleWriterRequest, FlexibleWriterResponse
from tools.flexible_writer.services import FlexibleWriterError, FlexibleWriterService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/flexible_writer", tags=["Flexible Writer"])


class FlexibleWriterHTTPError(HTTPException):
    """Base HTTP exception for the flexible writer module."""


class FlexibleWriterProcessingError(FlexibleWriterHTTPError):
    """Raised when the DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: FlexibleWriterError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (FlexibleWriterError): The domain exception that caused the failure.

    Raises:
        FlexibleWriterProcessingError: Always.
    """
    logger.error("Flexible writer failed to %s: %s", action, exc)
    raise FlexibleWriterProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/transform", response_model=FlexibleWriterResponse, status_code=status.HTTP_200_OK)
async def transform(
    payload: FlexibleWriterRequest,
    service: FlexibleWriterService = Depends(get_flexible_writer_service),
    _: str = Depends(verify_api_key),
) -> FlexibleWriterResponse:
    """
    Processes or transforms the input data under a system-prompt-defined persona.

    Args:
        payload (FlexibleWriterRequest): The validated request.
        service (FlexibleWriterService): Injected service layer.
        _: API key guard dependency.

    Returns:
        FlexibleWriterResponse: The transformation result.

    Raises:
        FlexibleWriterProcessingError: If the transformation pipeline fails.
    """
    try:
        return await service.transform(payload)
    except GenerationError as exc:
        _raise_processing_error("transform the input data", exc)
