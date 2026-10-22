import logging
from typing import Optional
from fastapi import Header, HTTPException
from core.config import settings

logger = logging.getLogger(__name__)


async def verify_api_key(x_api_key: Optional[str] = Header(None)) -> str:
    """
    Dependency to validate the API key from the X-API-Key request header.

    Shared across all sub-apps. If settings.API_KEY is blank, authentication
    is disabled and the request is allowed through.

    Args:
        x_api_key: The API key provided in the X-API-Key header.

    Returns:
        The validated API key string.

    Raises:
        HTTPException: 401 if the API key is missing or invalid.
    """
    expected_key = settings.API_KEY
    if not expected_key:
        logger.warning("API_KEY is not configured; API key authentication is disabled")
        return x_api_key or ""
    if x_api_key != expected_key:
        logger.warning("Invalid or missing API key attempt")
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return x_api_key
