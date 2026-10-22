import logging
import uuid
from pathlib import Path
from typing import List, Optional

import dspy
import yaml

from core.config import settings
from core.dspy_utils import build_lm, run_predictor
from linguistic.simulator.schemas import ChatMessage, ChatRequest, SimulationRequest

logger = logging.getLogger(__name__)


class SimulatorError(Exception):
    """Base exception for all simulator module failures."""


class GenerationError(SimulatorError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class PromptNotFoundError(SimulatorError):
    """Raised when a requested simulator prompt does not exist."""


class SituationSimulator(dspy.Signature):
    """
    You are an advanced behavioral simulation engine. Given a specific persona
    (system prompt), a scenario, and user input, you calculate the most logical
    and character-consistent course of action.
    """

    system_prompt: str = dspy.InputField(desc="The persona and personality traits you must embody.")
    scenario: str = dspy.InputField(desc="The setting or situation currently unfolding.")
    user_input: str = dspy.InputField(desc="The specific question or dialogue directed at the persona.")
    additional_context: Optional[str] = dspy.InputField(default=None, desc="Extra background info, history, or environmental factors.")
    seed_uuid: str = dspy.InputField(desc="A unique identifier to ensure variety or tracking for this specific run.")

    thought_process: str = dspy.OutputField(desc="A detailed 'Chain of Thought' explaining WHY the persona chooses this action.")
    chosen_action: str = dspy.OutputField(desc="A description of the physical or verbal action taken.")
    response_dialogue: str = dspy.OutputField(desc="The actual words spoken by the persona in character.")
    emotional_state: str = dspy.OutputField(desc="The internal feeling/mood of the character after this interaction.")


class SituationalChat(dspy.Signature):
    """
    You are an AI character in a specific scenario. Analyze the chat history
    and the current situation to decide what to do next. Stay strictly in
    character based on the System Prompt.
    """

    system_prompt: str = dspy.InputField(desc="Your persona, personality, and rules.")
    scenario: str = dspy.InputField(desc="The initial setting or ongoing situation.")
    chat_history: str = dspy.InputField(desc="The formatted history of past interactions.")
    user_input: str = dspy.InputField(desc="The latest message or action from the user.")

    thought: str = dspy.OutputField(desc="Your internal reasoning: Why are you saying this? What are you feeling?")
    dialogue: str = dspy.OutputField(desc="Your response to the user, written in character.")


class SimulationService:
    """Business layer wrapping the DSPy behavioral simulation pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def run_behavioral_sim(self, data: SimulationRequest) -> dict:
        """
        Executes the behavioral simulation using DSPy.

        Args:
            data (SimulationRequest): The validated simulation request.

        Returns:
            dict: The results of the simulation.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        run_id = str(uuid.uuid4())
        try:
            prediction = run_predictor(
                SituationSimulator,
                self.lm,
                system_prompt=data.persona,
                scenario=data.scenario,
                user_input=data.user_input,
                additional_context=data.additional_context or "N/A",
                seed_uuid=run_id,
            )
            logger.info("Simulation successful: %s", run_id)
            return {
                "simulation_id": run_id,
                "thought_process": prediction.thought_process,
                "chosen_action": prediction.chosen_action,
                "response_dialogue": prediction.response_dialogue,
                "emotional_state": prediction.emotional_state,
            }
        except Exception as exc:
            logger.error("Simulation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc


class ChatService:
    """Business layer wrapping the DSPy situational chat pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(cache=False)

    def execute_chat(self, data: ChatRequest) -> dict:
        """
        Runs a single turn in a situational chat.

        Args:
            data (ChatRequest): The validated chat request.

        Returns:
            dict: The thought, dialogue, and updated history list.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            formatted_history = "\n".join(f"{message.role}: {message.content}" for message in data.chat_history)
            result = run_predictor(
                SituationalChat,
                self.lm,
                system_prompt=data.persona,
                scenario=data.scenario,
                chat_history=formatted_history,
                user_input=data.user_input,
            )

            new_history = data.chat_history + [
                ChatMessage(role="User", content=data.user_input),
                ChatMessage(role="Assistant", content=result.dialogue),
            ]
            return {
                "thought": result.thought,
                "dialogue": result.dialogue,
                "updated_history": new_history,
            }
        except Exception as exc:
            logger.error("Chat engine error: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc


class PromptManager:
    """Persists simulator system prompts in a YAML file."""

    @staticmethod
    def _ensure_storage() -> None:
        """
        Ensures the storage file and its parent directory exist.
        """
        storage_path = Path(settings.SIMULATOR_PROMPTS_FILE)
        storage_path.parent.mkdir(parents=True, exist_ok=True)
        if not storage_path.exists():
            with storage_path.open("w") as file:
                yaml.dump({}, file)

    @staticmethod
    def _load_all() -> dict:
        """
        Loads all prompts from the YAML file.

        Returns:
            dict: A mapping of prompt names to their content.
        """
        storage_path = Path(settings.SIMULATOR_PROMPTS_FILE)
        PromptManager._ensure_storage()
        with storage_path.open("r") as file:
            return yaml.safe_load(file) or {}

    @staticmethod
    def save_prompt(name: str, content: str) -> None:
        """
        Saves or updates a prompt by name.

        Args:
            name (str): The prompt identifier.
            content (str): The system prompt content.
        """
        prompts = PromptManager._load_all()
        prompts[name] = content
        storage_path = Path(settings.SIMULATOR_PROMPTS_FILE)
        with storage_path.open("w") as file:
            yaml.dump(prompts, file)
        logger.info("Prompt '%s' saved successfully.", name)

    @staticmethod
    def get_prompt(name: str) -> str:
        """
        Retrieves a specific prompt.

        Args:
            name (str): The prompt identifier.

        Returns:
            str: The system prompt content.

        Raises:
            PromptNotFoundError: If the prompt does not exist.
        """
        prompts = PromptManager._load_all()
        if name not in prompts:
            logger.warning("Prompt not found: %s", name)
            raise PromptNotFoundError(f"Prompt '{name}' not found.")
        return prompts[name]

    @staticmethod
    def list_names() -> List[str]:
        """
        Returns a list of all prompt names.

        Returns:
            List[str]: The stored prompt names.
        """
        return list(PromptManager._load_all().keys())
