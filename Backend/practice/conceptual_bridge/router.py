import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.conceptual_bridge.dependencies import get_conceptual_bridge_service
from practice.conceptual_bridge.schemas import BridgeRequest, BridgeResponse
from practice.conceptual_bridge.services import BridgeError, ConceptualBridgeService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/conceptual_bridge", tags=["Conceptual Bridge Builder"])


class BridgeHTTPError(HTTPException):
    """Base HTTP exception for the conceptual bridge module."""


class BridgeProcessingError(BridgeHTTPError):
    """Raised when the DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: BridgeError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (BridgeError): The domain exception that caused the failure.

    Raises:
        BridgeProcessingError: Always.
    """
    logger.error("Conceptual bridge failed to %s: %s", action, exc)
    raise BridgeProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=BridgeResponse, status_code=status.HTTP_200_OK)
async def generate_bridge(
    payload: BridgeRequest,
    service: ConceptualBridgeService = Depends(get_conceptual_bridge_service),
    _: str = Depends(verify_api_key),
) -> BridgeResponse:
    """
    Finds a creative structural link between two disparate ideas.

    Args:
        payload (BridgeRequest): The validated request.
        service (ConceptualBridgeService): Injected service layer.
        _: API key guard dependency.

    Returns:
        BridgeResponse: The conceptual bridge.

    Raises:
        BridgeProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.build_bridge(payload)
    except GenerationError as exc:
        _raise_processing_error("build the conceptual bridge", exc)
