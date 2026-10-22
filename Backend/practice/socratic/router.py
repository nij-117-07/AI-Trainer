import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import verify_api_key
from practice.socratic.dependencies import get_socratic_service
from practice.socratic.schemas import SocraticRequest, SocraticResponse
from practice.socratic.services import GenerationError, SocraticError, SocraticService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/socratic", tags=["Socratic Challenger"])


class SocraticHTTPError(HTTPException):
    """Base HTTP exception for the socratic module."""


class SocraticProcessingError(SocraticHTTPError):
    """Raised when the DSPy pipeline fails to produce content."""


def _raise_processing_error(action: str, exc: SocraticError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        action (str): Human-readable description of the failed operation.
        exc (SocraticError): The domain exception that caused the failure.

    Raises:
        SocraticProcessingError: Always.
    """
    logger.error("Socratic module failed to %s: %s", action, exc)
    raise SocraticProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to {action}.",
    )


@router.post("/challenge", response_model=SocraticResponse, status_code=status.HTTP_200_OK)
async def socratic_challenge(
    payload: SocraticRequest,
    service: SocraticService = Depends(get_socratic_service),
    _: str = Depends(verify_api_key),
) -> SocraticResponse:
    """
    Challenges a user statement using Socratic questioning to identify
    logical fallacies and encourage deeper critical thinking.

    Args:
        payload (SocraticRequest): The validated request.
        service (SocraticService): Injected service layer.
        _: API key guard dependency.

    Returns:
        SocraticResponse: The structured logical challenge.

    Raises:
        SocraticProcessingError: If the challenge pipeline fails.
    """
    try:
        return await service.get_socratic_challenge(payload)
    except GenerationError as exc:
        _raise_processing_error("generate the socratic challenge", exc)
