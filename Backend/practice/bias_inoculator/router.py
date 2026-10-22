import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.bias_inoculator.dependencies import get_bias_inoculator_service
from practice.bias_inoculator.schemas import BiasRequest, BiasResponse
from practice.bias_inoculator.services import BiasError, BiasInoculatorService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bias_inoculator", tags=["Cognitive Bias Inoculator"])


class BiasHTTPError(HTTPException):
    """Base HTTP exception for the bias inoculator module."""


class BiasProcessingError(BiasHTTPError):
    """Raised when the DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: BiasError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (BiasError): The domain exception that caused the failure.

    Raises:
        BiasProcessingError: Always.
    """
    logger.error("Bias inoculator failed to %s: %s", action, exc)
    raise BiasProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=BiasResponse, status_code=status.HTTP_200_OK)
async def generate_bias_scenario(
    payload: BiasRequest,
    service: BiasInoculatorService = Depends(get_bias_inoculator_service),
    _: str = Depends(verify_api_key),
) -> BiasResponse:
    """
    Generates a 'System 1 vs System 2' training scenario.
    The response contains both the scenario (to show the user) and the rational
    reveal (to show after the user answers).

    Args:
        payload (BiasRequest): The validated request.
        service (BiasInoculatorService): Injected service layer.
        _: API key guard dependency.

    Returns:
        BiasResponse: The training scenario and rational reveal.

    Raises:
        BiasProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.inoculate_bias(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the bias training scenario", exc)
