import logging
from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from learning.memory_helper.dependencies import get_memory_service, verify_api_key
from learning.memory_helper.schemas import MemoryRequest, MemoryResponse
from learning.memory_helper.services import GenerationError, MemoryService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/memory_helper", tags=["Memory Specialist"])


class MemoryHTTPError(HTTPException):
    """Base HTTP exception for the memory helper module."""


class MemoryProcessingError(MemoryHTTPError):
    """Raised when the generation pipeline fails to produce content."""


def _raise_processing_error(exc: GenerationError) -> NoReturn:
    """
    Logs the underlying failure and raises the module-level HTTP error.

    Args:
        exc (GenerationError): The domain exception that caused the failure.

    Raises:
        MemoryProcessingError: Always.
    """
    logger.error("Memory helper failed to process request: %s", exc)
    raise MemoryProcessingError(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to process the memory request.",
    )


@router.post("/process", response_model=MemoryResponse, status_code=status.HTTP_200_OK)
async def process_memory_request(
    payload: MemoryRequest,
    service: MemoryService = Depends(get_memory_service),
    _: str = Depends(verify_api_key),
) -> MemoryResponse:
    """
    Takes complex data and returns structured mnemonics and a retention plan.

    Args:
        payload (MemoryRequest): The validated request schema.
        service (MemoryService): Injected service layer.
        _ (str): API key guard dependency.

    Returns:
        MemoryResponse: The explanation, memory hooks, and retention plan.

    Raises:
        MemoryProcessingError: If the generation pipeline fails.
    """
    try:
        return await service.run_agent(payload)
    except GenerationError as exc:
        _raise_processing_error(exc)
