import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def sanitize_collection_name(user_name: str) -> str:
    """Generate a Qdrant-safe collection name from a username.

    Args:
        user_name: Raw username string.

    Returns:
        Sanitized collection name: lowercase alphanumeric with '-vector-store' suffix.
    """
    sanitized = "".join(filter(str.isalnum, user_name.lower()))
    return f"{sanitized}-vector-store"


def build_payload(text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Build a Qdrant payload dict from text and metadata.

    Args:
        text: Chunk text content.
        metadata: Arbitrary key-value metadata.

    Returns:
        Payload dict with 'text' key plus all metadata fields.
    """
    return {"text": text, **metadata}
