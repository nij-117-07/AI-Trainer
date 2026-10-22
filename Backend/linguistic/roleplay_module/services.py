import logging
from pathlib import Path
from typing import Dict, List, Optional

import dspy
import yaml

from core.config import settings
from core.dspy_utils import build_lm, run_predictor
from linguistic.roleplay_module.schemas import RoleplayRecord, RoleplayRequest

logger = logging.getLogger(__name__)


class RoleplayError(Exception):
    """Base exception for all roleplay_module module failures."""


class GenerationError(RoleplayError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class RoleplayNotFoundError(RoleplayError):
    """Raised when a requested roleplay persona does not exist."""


class RoleplayExistsError(RoleplayError):
    """Raised when a roleplay persona already exists."""


class RoleplayChatbot(dspy.Signature):
    """
    You are an immersive roleplay assistant. You must strictly adhere to the
    provided Persona System Prompt and maintain the persona throughout the
    conversation. Use the chat history to maintain continuity and respond in
    the specified language.
    """

    roleplay_system_prompt: str = dspy.InputField(desc="The core persona, personality traits, and rules for the roleplay.")
    chat_history: List[Dict[str, str]] = dspy.InputField(desc="List of previous messages between the user and assistant.")
    current_user_message: str = dspy.InputField(desc="The latest message from the user.")
    language: str = dspy.InputField(desc="The language the chatbot must communicate in (e.g., English, Spanish, Hindi).")
    seed_uuid: str = dspy.InputField(desc="A unique identifier for the session to maintain consistency.")
    additional_instructions: Optional[str] = dspy.InputField(desc="Specific constraints or nudges for this specific turn.")

    response_message: str = dspy.OutputField(desc="The roleplay response for the user, following all persona and language rules.")


class RoleplayService:
    """Business layer wrapping the DSPy roleplay chat pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def generate_response(self, data: RoleplayRequest, persona_prompt: Optional[str] = None) -> str:
        """
        Executes the DSPy ChainOfThought roleplay generation.

        Args:
            data (RoleplayRequest): The validated request payload.
            persona_prompt (Optional[str]): Optional persona override; falls back to data.system_prompt.

        Returns:
            str: The AI's generated in-character response.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            history_dicts = [message.model_dump() for message in data.history]
            prediction = run_predictor(
                RoleplayChatbot,
                self.lm,
                roleplay_system_prompt=persona_prompt or data.system_prompt,
                chat_history=history_dicts,
                current_user_message=data.message,
                language=data.language,
                seed_uuid=data.seed,
                additional_instructions=data.additional_instructions,
            )
            return prediction.response_message
        except Exception as exc:
            logger.error("Roleplay generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc


class RoleplayStorageService:
    """Persists roleplay personas as YAML files on disk."""

    def __init__(self) -> None:
        self.data_dir = Path(settings.ROLEPLAY_STORAGE_DIR)
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def _get_path(self, name: str) -> Path:
        """
        Resolves the YAML path for a persona name.

        Args:
            name (str): The persona name.

        Returns:
            Path: The resolved storage path.
        """
        return self.data_dir / f"{name.lower().replace(' ', '_')}.yaml"

    def create_role(self, role: RoleplayRecord) -> RoleplayRecord:
        """
        Creates a new roleplay YAML file.

        Args:
            role (RoleplayRecord): The persona to persist.

        Returns:
            RoleplayRecord: The persisted persona.

        Raises:
            RoleplayExistsError: If a persona with the same name already exists.
        """
        path = self._get_path(role.name)
        if path.exists():
            logger.warning("Role already exists: %s", role.name)
            raise RoleplayExistsError(f"Role '{role.name}' already exists.")
        with path.open("w") as file:
            yaml.dump(role.model_dump(), file)
        logger.info("Created role: %s", role.name)
        return role

    def list_roles(self) -> List[str]:
        """
        Lists all available role names.

        Returns:
            List[str]: The stored persona names.
        """
        return sorted(path.stem for path in self.data_dir.glob("*.yaml"))

    def get_role(self, name: str) -> RoleplayRecord:
        """
        Gets the system prompt for a specific role.

        Args:
            name (str): The persona name.

        Returns:
            RoleplayRecord: The stored persona.

        Raises:
            RoleplayNotFoundError: If the persona does not exist.
        """
        path = self._get_path(name)
        if not path.exists():
            logger.warning("Role not found: %s", name)
            raise RoleplayNotFoundError(f"Role '{name}' not found.")
        with path.open("r") as file:
            data = yaml.safe_load(file)
            return RoleplayRecord(**data)

    def update_role(self, name: str, prompt: str) -> RoleplayRecord:
        """
        Updates the prompt for an existing role.

        Args:
            name (str): The persona name.
            prompt (str): The new persona prompt.

        Returns:
            RoleplayRecord: The updated persona.

        Raises:
            RoleplayNotFoundError: If the persona does not exist.
        """
        role = self.get_role(name)
        role.prompt = prompt
        with self._get_path(name).open("w") as file:
            yaml.dump(role.model_dump(), file)
        logger.info("Updated role: %s", name)
        return role

    def delete_role(self, name: str) -> dict:
        """
        Deletes a roleplay YAML file.

        Args:
            name (str): The persona name.

        Returns:
            dict: A confirmation message.

        Raises:
            RoleplayNotFoundError: If the persona does not exist.
        """
        path = self._get_path(name)
        if not path.exists():
            logger.warning("Role not found: %s", name)
            raise RoleplayNotFoundError(f"Role '{name}' not found.")
        path.unlink()
        logger.info("Deleted role: %s", name)
        return {"message": f"Role {name} deleted"}
