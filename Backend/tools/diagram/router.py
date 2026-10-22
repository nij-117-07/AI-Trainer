import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from tools.diagram.dependencies import get_diagram_service
from tools.diagram.schemas import DiagramRequest, DiagramResponse
from tools.diagram.services import DiagramError, DiagramService, GenerationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/diagram", tags=["Diagram Generator"])


class DiagramHTTPError(HTTPException):
    """Base HTTP exception for the diagram module."""


class DiagramProcessingError(DiagramHTTPError):
    """Raised when the diagram generation pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: DiagramError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (DiagramError): The domain exception that caused the failure.

    Raises:
        DiagramProcessingError: Always.
    """
    logger.error("Diagram module failed to %s: %s", action, exc)
    raise DiagramProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/generate", response_model=DiagramResponse, status_code=status.HTTP_200_OK)
async def generate_diagram(
    payload: DiagramRequest,
    service: DiagramService = Depends(get_diagram_service),
    _: str = Depends(verify_api_key),
) -> DiagramResponse:
    """
    Generates or edits diagram code in Mermaid or Draw.io format.

    Args:
        payload (DiagramRequest): The validated request schema.
        service (DiagramService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        DiagramResponse: The explanation message and generated diagram code.

    Raises:
        DiagramProcessingError: If the diagram generation pipeline fails.
    """
    try:
        return service.generate(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the diagram", exc)
