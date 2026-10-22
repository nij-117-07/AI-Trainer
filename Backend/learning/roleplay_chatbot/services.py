import logging
from typing import Any, Dict, List

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.roleplay_chatbot.schemas import (
    RoleplayChatRequest,
    RoleplayChatResponse,
)

logger = logging.getLogger(__name__)


class RoleplayChatError(Exception):
    """Base exception for all roleplay chatbot module failures."""


class GenerationError(RoleplayChatError):
    """Raised when the underlying DSPy pipeline fails to produce a response."""


class RoleplayChatbot(dspy.Signature):
    """
    You are a Roleplay Chatbot. You will be given a System Prompt that defines
    your character's persona, personality, backstory, and behavioral rules.
    You will also receive the conversation history between the user and yourself.

    Your job is to:
    - Stay fully in character at all times.
    - Respond naturally according to the persona defined in the system prompt.
    - Use the conversation history to maintain context, continuity, and consistency.
    - Never break character or reference being an AI unless the character itself is an AI.
    - Match the tone, speech patterns, and emotional style of the character.
    """

    system_prompt: str = dspy.InputField(
        desc="The character's full persona definition — personality, backstory, speech style, rules, and behavioral constraints."
    )
    conversation_history: str = dspy.InputField(
        desc=(
            "The full conversation history as a formatted string. "
            "Each line follows the format: [Role]: Message content. "
            "Read this carefully to understand context and respond accordingly."
        )
    )
    latest_user_message: str = dspy.InputField(
        desc="The most recent message from the user that you need to respond to."
    )

    character_response: str = dspy.OutputField(
        desc=(
            "The in-character reply to the user's latest message. "
            "This should feel natural, immersive, and consistent with the persona. "
            "Can include dialogue, actions (wrapped in *asterisks*), and internal thoughts."
        )
    )
    emotion_tag: str = dspy.OutputField(
        desc="A short emotional tag describing the character's current emotional state (e.g. amused, curious,愤怒)."
    )
    action_description: str = dspy.OutputField(
        desc="A brief physical action or stage direction the character performs (e.g. 'adjusts glasses', 'smirks')."
    )


class RoleplayChatService:
    """Business layer wrapping the DSPy roleplay chatbot pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.8, cache=False)

    @staticmethod
    def _coerce_str(value: object, default: str = "") -> str:
        """
        Coerces a raw value into a string.

        Args:
            value: The raw LLM output.
            default: Fallback value.

        Returns:
            The coerced string.
        """
        if value is None:
            return default
        return str(value)

    @staticmethod
    def _format_history(history: list, character_name: str = "Character") -> str:
        """
        Converts a list of message dicts into a readable transcript string.

        Args:
            history: The chat history messages.
            character_name: Name used to label assistant turns.

        Returns:
            A formatted transcript string.
        """
        if not history:
            return "No previous interaction."
        lines: List[str] = []
        for msg in history:
            role = msg.role if hasattr(msg, "role") else msg.get("role", "unknown")
            content = msg.content if hasattr(msg, "content") else msg.get("content", "")
            if role == "system":
                continue
            elif role == "user":
                lines.append(f"[User]: {content}")
            elif role == "assistant":
                lines.append(f"[{character_name}]: {content}")
            else:
                lines.append(f"[{role}]: {content}")
        return "\n".join(lines)

    async def chat_turn(self, data: RoleplayChatRequest) -> RoleplayChatResponse:
        """
        Generates a single in-character response for the current turn.

        Args:
            data: The validated roleplay chat request.

        Returns:
            The character's reply, emotion, and action.

        Raises:
            GenerationError: If the DSPy pipeline fails to respond.
        """
        try:
            history_text = self._format_history(data.history, data.character_name)
            prediction = run_predictor(
                RoleplayChatbot,
                self.lm,
                system_prompt=data.system_prompt,
                conversation_history=history_text,
                latest_user_message=data.user_input,
            )

            logger.info(
                "Roleplay chat turn for character '%s'",
                data.character_name,
            )
            return RoleplayChatResponse(
                response=self._coerce_str(prediction.character_response),
                emotion=self._coerce_str(prediction.emotion_tag),
                action=self._coerce_str(prediction.action_description),
            )
        except Exception as exc:
            logger.error(
                "Roleplay chat failed for character '%s': %s",
                data.character_name,
                exc,
                exc_info=True,
            )
            raise GenerationError(str(exc)) from exc
