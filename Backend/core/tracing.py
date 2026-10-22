import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


def _dump_payload(payload: Any) -> str:
    """
    Serializes a payload into a JSON string for logging.

    Args:
        payload (Any): A pydantic model or any loggable object.

    Returns:
        str: A JSON string for pydantic models, str() otherwise.
    """
    if hasattr(payload, "model_dump_json"):
        return payload.model_dump_json()
    return str(payload)


def log_api_trace(
    action: str,
    request: Optional[Any] = None,
    response: Optional[Any] = None,
    logger_: Optional[logging.Logger] = None,
) -> None:
    """
    Emits debug-level logs for the request and response payloads of an action.

    Reusable across all modules and APIs. When a logger is provided, log
    records are attributed to the calling module; otherwise they fall back to
    this module's logger.

    Args:
        action (str): Human-readable label for the API operation.
        request (Optional[Any]): The request payload (e.g., a pydantic model).
        response (Optional[Any]): The response payload (e.g., a pydantic model).
        logger_ (Optional[logging.Logger]): The calling module's logger, if any.

    Returns:
        None
    """
    target = logger_ or logger
    if request is not None:
        target.debug("%s | request=%s", action, _dump_payload(request))
    if response is not None:
        target.debug("%s | response=%s", action, _dump_payload(response))
