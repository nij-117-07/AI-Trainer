import base64
import io
import logging
import uuid
from pathlib import Path
from typing import Optional

import dspy
from PIL import Image

from core.config import settings
from core.dspy_utils import build_lm, run_predictor
from tools.vision_converter.schemas import ImageToMarkdown, VisionConversionResponse

logger = logging.getLogger(__name__)


class VisionError(Exception):
    """Base exception for all vision converter module failures."""


class GenerationError(VisionError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class VisionService:
    """Stateless business layer wrapping the DSPy vision-to-markdown pipeline."""

    def __init__(self) -> None:
        self.storage_dir = Path(settings.VISION_STORAGE_DIR)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.lm = build_lm(temperature=0.5, cache=False)

    def convert_image(self, image_bytes: bytes, filename: str, instruction: str) -> VisionConversionResponse:
        """
        Stores the image, compresses it when larger than 1MB, and runs the vision pipeline.

        Args:
            image_bytes (bytes): The raw uploaded image content.
            filename (str): The original filename, used to preserve the extension.
            instruction (str): Instructions on what to extract from the image.

        Returns:
            VisionConversionResponse: The converted Markdown output.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        file_path = self._save_image(image_bytes, filename)
        try:
            if file_path.stat().st_size > 1024 * 1024:
                logger.info("Compressing large vision image: %s", file_path.name)
                image_bytes = self._compress_image(file_path)
            markdown_output = self._convert(image_bytes, instruction)
            logger.info("Converted image %s to Markdown", file_path.name)
            return VisionConversionResponse(markdown_output=markdown_output)
        except GenerationError:
            raise
        except Exception as exc:
            logger.error("Vision conversion failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    def _save_image(self, content: bytes, filename: str) -> Path:
        """
        Persists the uploaded image to the configured storage directory.

        Args:
            content (bytes): The raw image bytes.
            filename (str): The original upload filename.

        Returns:
            Path: The saved image location.
        """
        ext = Path(filename).suffix or ".jpg"
        file_path = self.storage_dir / f"{uuid.uuid4()}{ext}"
        file_path.write_bytes(content)
        logger.info("Saved vision image: %s", file_path)
        return file_path

    def _compress_image(self, image_path: Path, target_size_kb: int = 1000) -> bytes:
        """
        Compresses the image to stay under the target size in kilobytes.

        Args:
            image_path (Path): The path to the saved image.
            target_size_kb (int): The maximum desired size in KB.

        Returns:
            bytes: The compressed JPEG bytes.
        """
        try:
            with Image.open(image_path) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                quality = 90
                output = io.BytesIO()
                while True:
                    output.seek(0)
                    output.truncate()
                    img.save(output, format="JPEG", quality=quality, optimize=True)
                    if output.tell() <= target_size_kb * 1024 or quality <= 20:
                        break
                    quality -= 10
                return output.getvalue()
        except Exception as exc:
            logger.warning("Image compression failed, falling back to raw bytes: %s", exc)
            return image_path.read_bytes()

    def _convert(self, image_bytes: bytes, instruction: str) -> str:
        """
        Runs the DSPy ChainOfThought vision conversion on the image bytes.

        Args:
            image_bytes (bytes): The image content to convert.
            instruction (str): Instructions on what to extract.

        Returns:
            str: The converted Markdown string.

        Raises:
            GenerationError: If the DSPy pipeline fails.
        """
        try:
            base64_str = base64.b64encode(image_bytes).decode("utf-8")
            image_uri = f"data:image/jpeg;base64,{base64_str}"
            img_obj = dspy.Image(url=image_uri)

            prediction = run_predictor(
                ImageToMarkdown,
                self.lm,
                image=img_obj,
                user_instruction=instruction,
            )
            return prediction.markdown_output or ""
        except Exception as exc:
            logger.error("DSPy vision conversion error: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
