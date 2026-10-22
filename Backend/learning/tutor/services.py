import logging
from pathlib import Path
from typing import List, Optional

import dspy
import yaml

from core.config import settings
from core.dspy_utils import build_lm, run_predictor
from learning.tutor.models import PromptFile
from learning.tutor.schemas import PromptCreateUpdate, TutorRequest, TutorResponse

logger = logging.getLogger(__name__)


class TutorError(Exception):
    """Base exception for all tutor module failures."""


class GenerationError(TutorError):
    """Raised when the underlying DSPy pipeline fails to produce a response."""


class PromptError(TutorError):
    """Base exception for all prompt template storage failures."""


class PromptNotFoundError(PromptError):
    """Raised when a requested prompt template does not exist."""


class PromptStorageError(PromptError):
    """Raised when a prompt template cannot be read or written."""


class AdaptiveTutorSignature(dspy.Signature):
    """
    You are an adaptive tutor. Tailor your explanation to the student's level,
    learning style and current scenario, using the supplied persona.
    """

    system_prompt: str = dspy.InputField(desc="The persona and pedagogical rules (e.g., Socratic method).")
    user_query: str = dspy.InputField(desc="The student's specific question or struggle.")
    student_level: str = dspy.InputField(desc="Level: (e.g., Toddler, High School, Expert, Non-native Speaker).")
    learning_style: str = dspy.InputField(desc="The preferred framing (e.g., use metaphors vs. core logic vs. hands-on examples).")
    current_scenario: str = dspy.InputField(desc="The context of learning (e.g., 'preparing for an exam').")
    chat_history: List[dict] = dspy.InputField(desc="Previous interaction context.")
    last_topic_taught: Optional[str] = dspy.InputField(desc="The context of the previous lesson.")

    adapted_explanation: str = dspy.OutputField(desc="The teaching content, tailored specifically to the user level.")
    concept_analogy: Optional[str] = dspy.OutputField(desc="A specific metaphor or 'mental hook' to help the student remember.")
    tutor_feedback: str = dspy.OutputField(desc="The conversational response and a nudge/question for the student.")


class TutorService:
    """Business layer wrapping the DSPy adaptive tutoring pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.1)

    async def get_adaptive_response(self, data: TutorRequest) -> TutorResponse:
        """
        Generates a tailored explanation for the student's query.

        Args:
            data: The validated tutoring request.

        Returns:
            TutorResponse: The adapted explanation, analogy, and feedback.

        Raises:
            GenerationError: If the DSPy pipeline fails to respond.
        """
        try:
            history_dicts = [{"role": m.role, "content": m.content} for m in data.chat_history[-10:]]
            logger.info("Processing tutor request for level: %s", data.student_level)

            prediction = run_predictor(
                AdaptiveTutorSignature,
                self.lm,
                user_query=data.user_query,
                system_prompt=data.system_prompt,
                student_level=data.student_level,
                learning_style=data.learning_style,
                current_scenario=data.current_scenario,
                last_topic_taught=data.last_topic_taught,
                chat_history=history_dicts,
            )

            return TutorResponse(
                adapted_explanation=prediction.adapted_explanation,
                concept_analogy=prediction.concept_analogy,
                tutor_feedback=prediction.tutor_feedback,
            )
        except Exception as exc:
            logger.error("DSPy execution error: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc


class PromptService:
    """Business layer for CRUD operations on YAML prompt templates."""

    def __init__(self) -> None:
        if settings.TUTOR_PROMPTS_DIR:
            self.storage_dir = Path(settings.TUTOR_PROMPTS_DIR)
        else:
            self.storage_dir = Path(__file__).resolve().parent / "prompts"
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _get_path(self, name: str) -> Path:
        """
        Resolves the storage path for a prompt name, sanitizing the filename.

        Args:
            name: The prompt identifier.

        Returns:
            Path: The YAML file path for the prompt.
        """
        safe_name = "".join(c for c in name if c.isalnum() or c in (" ", "_")).rstrip()
        return self.storage_dir / f"{safe_name}.yaml"

    def create_or_update_prompt(self, data: PromptCreateUpdate) -> str:
        """
        Persists a prompt template, creating or replacing the YAML file.

        Args:
            data: The prompt name and content.

        Returns:
            str: The sanitized prompt name that was saved.

        Raises:
            PromptStorageError: If the file cannot be written.
        """
        file_path = self._get_path(data.name)
        prompt_file = PromptFile(name=data.name, content=data.content)
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                yaml.dump(prompt_file.model_dump(mode="json"), f, default_flow_style=False)
            logger.info("Saved prompt template %s", data.name)
            return data.name
        except Exception as exc:
            logger.error("Failed to save prompt %s: %s", data.name, exc)
            raise PromptStorageError(f"Could not save prompt '{data.name}'") from exc

    def list_prompts(self) -> List[str]:
        """
        Lists all available prompt template names.

        Returns:
            List[str]: Sorted prompt names (without extension).
        """
        return sorted(f.stem for f in self.storage_dir.glob("*.yaml"))

    def read_prompt_full(self, name: str) -> PromptFile:
        """
        Reads a prompt template with its metadata.

        Args:
            name: The prompt identifier.

        Returns:
            PromptFile: The stored prompt document.

        Raises:
            PromptNotFoundError: If the prompt does not exist.
            PromptStorageError: If the file cannot be read or parsed.
        """
        file_path = self._get_path(name)
        if not file_path.exists():
            raise PromptNotFoundError(f"Prompt '{name}' not found")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            return PromptFile(**data)
        except PromptNotFoundError:
            raise
        except Exception as exc:
            logger.error("Failed to read prompt %s: %s", name, exc)
            raise PromptStorageError(f"Could not read prompt '{name}'") from exc

    def delete_prompt(self, name: str) -> None:
        """
        Deletes a prompt template file.

        Args:
            name: The prompt identifier.

        Raises:
            PromptNotFoundError: If the prompt does not exist.
            PromptStorageError: If the file cannot be removed.
        """
        file_path = self._get_path(name)
        if not file_path.exists():
            raise PromptNotFoundError(f"Prompt '{name}' not found")
        try:
            file_path.unlink()
            logger.info("Deleted prompt template %s", name)
        except Exception as exc:
            logger.error("Failed to delete prompt %s: %s", name, exc)
            raise PromptStorageError(f"Could not delete prompt '{name}'") from exc
