import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from tools.charts.dependencies import get_chart_service
from tools.charts.schemas import ChartRequest, ChartResponse
from tools.charts.services import ChartError, ChartService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/charts", tags=["Chart.js Generator"])


class ChartHTTPError(HTTPException):
    """Base HTTP exception for the charts module."""


class ChartProcessingError(ChartHTTPError):
    """Raised when the chart generation pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: ChartError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (ChartError): The domain exception that caused the failure.

    Raises:
        ChartProcessingError: Always.
    """
    logger.error("Charts failed to %s: %s", action, exc)
    raise ChartProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=ChartResponse, status_code=status.HTTP_200_OK)
async def generate_chart(
    payload: ChartRequest,
    service: ChartService = Depends(get_chart_service),
    _: str = Depends(verify_api_key),
) -> ChartResponse:
    """
    Generates a Chart.js visualization from raw data and user instructions.

    Args:
        payload (ChartRequest): The validated request schema.
        service (ChartService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        ChartResponse: The explanation message and generated HTML/JS code.

    Raises:
        ChartProcessingError: If the chart generation pipeline fails.
    """
    try:
        return service.generate_chart(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the chart", exc)
