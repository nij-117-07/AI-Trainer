import base64
import io
import logging
import uuid
from pathlib import Path
from typing import List, Literal

import dspy
from PIL import Image

from core.config import settings
from core.dspy_utils import build_lm, run_predictor
from tools.ingredients.schemas import IngredientAnalysisResponse

logger = logging.getLogger(__name__)


class IngredientError(Exception):
    """Base exception for all ingredients module failures."""


class GenerationError(IngredientError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class IngredientsChecker(dspy.Signature):
    """
    You are an expert nutritionist and food safety analyst. Analyze the provided
    ingredients (via image or text) and categorize the product on a Health Level
    scale from 1 to 5.

    Level Scale:
    1: Ultra-processed / Harmful additives (Avoid)
    2: High Sugar/Sodium or Artificial Preservatives
    3: Moderately processed but generally safe
    4: Whole foods with minimal processing
    5: Organic / Pure / Highly Nutritious (Excellent)
    """

    ingredients_image: dspy.Image = dspy.InputField(description="Photo of the ingredients list on the packaging.")
    manual_text_input: str = dspy.InputField(default="", description="Optional manual text of ingredients if the image is blurry.")

    extracted_ingredients: List[str] = dspy.OutputField(description="List of detected ingredients.")
    health_level: Literal[1, 2, 3, 4, 5] = dspy.OutputField(description="The assigned health level (1-5).")
    risk_factors: List[str] = dspy.OutputField(description="List of concerning additives, allergens, or high-sugar items.")
    summary_analysis: str = dspy.OutputField(description="A brief explanation of why this level was assigned.")


class IngredientVisionService:
    """Business layer wrapping the DSPy ingredient vision analysis pipeline."""

    def __init__(self) -> None:
        self.storage_dir = Path(settings.INGREDIENTS_STORAGE_DIR)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.lm = build_lm(temperature=0.1, cache=False)

    def check_ingredients(self, image_bytes: bytes, filename: str, manual_text: str) -> IngredientAnalysisResponse:
        """
        Stores the image, compresses it if needed, and runs the DSPy analysis.

        Args:
            image_bytes (bytes): The raw uploaded image content.
            filename (str): The original filename, used to preserve the extension.
            manual_text (str): Optional manual text correction of the ingredients.

        Returns:
            IngredientAnalysisResponse: The extracted ingredients and health analysis.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        file_path = self._save_image(image_bytes, filename)
        try:
            if file_path.stat().st_size > 1024 * 1024:
                logger.info("Compressing large ingredient image: %s", file_path.name)
                image_bytes = self._compress_image(file_path)
            return self._analyze(image_bytes, manual_text, file_path)
        except GenerationError:
            raise
        except Exception as exc:
            logger.error("Ingredient analysis failed: %s", exc, exc_info=True)
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
        logger.info("Saved ingredient image: %s", file_path)
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

    def _analyze(self, image_bytes: bytes, manual_text: str, file_path: Path) -> IngredientAnalysisResponse:
        """
        Runs the DSPy ChainOfThought analysis on the image bytes.

        Args:
            image_bytes (bytes): The image content to analyze.
            manual_text (str): Optional manual ingredient text.
            file_path (Path): The stored image path for the response.

        Returns:
            IngredientAnalysisResponse: The validated analysis result.

        Raises:
            GenerationError: If the DSPy pipeline fails.
        """
        try:
            base64_str = base64.b64encode(image_bytes).decode("utf-8")
            image_uri = f"data:image/jpeg;base64,{base64_str}"
            img_obj = dspy.Image(url=image_uri)

            prediction = run_predictor(
                IngredientsChecker,
                self.lm,
                ingredients_image=img_obj,
                manual_text_input=manual_text,
            )

            return IngredientAnalysisResponse(
                extracted_ingredients=prediction.extracted_ingredients,
                health_level=int(prediction.health_level),
                risk_factors=prediction.risk_factors,
                summary_analysis=prediction.summary_analysis,
                file_path=str(file_path),
            )
        except Exception as exc:
            logger.error("DSPy ingredient analysis error: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
