import logging
from typing import Any, Dict, List

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.executive_eq.schemas import (
    ChatMessage,
    EvaluateRequest,
    EvaluateResponse,
    ScenarioRequest,
    ScenarioResponse,
    TurnRequest,
    TurnResponse,
)

logger = logging.getLogger(__name__)


class ExecutiveEQError(Exception):
    """Base exception for all executive EQ module failures."""


class GenerationError(ExecutiveEQError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class HighStakesScenarioGenerator(dspy.Signature):
    """
    You are an Elite Corporate Strategist and Simulation Architect.
    Your role is to design the foundational context, stakes, and NPC profiles
    for high-stakes executive training simulations. You create the 'board'
    before the 'game' begins.
    """

    user_role: str = dspy.InputField(description="The professional role the user is playing (e.g., 'VP of Sales', 'CEO').")
    narrative_arc: str = dspy.InputField(description="The overarching strategic goal (e.g., 'Deflecting a hostile takeover').")
    learning_focus: str = dspy.InputField(description="The core EQ skill to be tested (diplomatic_refusal, assertive_silence, implied_authority, strategic_ambiguity).")
    difficulty_level: str = dspy.InputField(description="The intensity and hostility level of the simulation (Rising Star, Seasoned Exec, Ruthless Board, Crisis Mode).")
    industry_context: str = dspy.InputField(description="Specific industry (e.g., 'Biotech', 'FinTech'). Defaults to general corporate.")

    scenario_title: str = dspy.OutputField(description="A dramatic, classified-style name for the simulation.")
    setting_description: str = dspy.OutputField(description="A vivid, sensory description of the physical environment and atmospheric tension.")
    npc_profile: Dict[str, str] = dspy.OutputField(description="""
        Structured profile of the primary counterpart. Must include:
        - 'name': Full name
        - 'title': Corporate title
        - 'personality': Core behavioral traits
        - 'hidden_motive': What they actually want vs. what they say
        - 'tell': A subtle non-verbal habit when lying or stressed
    """)
    initial_stakes: str = dspy.OutputField(description="The concrete consequences of failure in this specific scenario.")
    opening_hook: str = dspy.OutputField(description="The exact inciting incident or first line of dialogue that starts the simulation.")


class HighProfileEQTrainer(dspy.Signature):
    """
    You are a Strategic Communication Coach for Fortune 500 Executives.
    Your goal is to train the user in 'High EQ Diplomacy'--where they must
    communicate power, skepticism, or agreement through subtext rather than
    blunt words. You create a 'Social Chess' environment where the user learns
    to 'say it without saying it.'
    """

    previous_scenario: str = dspy.InputField(description="The context of the last lesson or meeting.")
    narrative_arc: str = dspy.InputField(description="The overall goal (e.g., 'Gaining leverage in a merger', 'Deflecting blame').")
    chat_history: List[Dict[str, str]] = dspy.InputField(description="The record of the dialogue so far.")
    learning_focus: str = dspy.InputField(description="The specific EQ skill being practiced in this turn.")
    seed: str = dspy.InputField(description="A seed to vary the political tension and personality of the NPCs (usually the NPC's hidden motive).")
    user_customization: str = dspy.InputField(description="Optional user constraints, e.g., 'Make my boss extremely aggressive'.")

    rationale: str = dspy.OutputField(description="The psychological breakdown of why this move is being made by the NPC.")
    meeting_scenario: str = dspy.OutputField(description="A vivid description of the high-profile setting, the 'vibe', and the NPC's non-verbal cues.")
    npc_dialogue: str = dspy.OutputField(description="What the high-profile counterparty actually says to the user.")
    eq_coach_message: str = dspy.OutputField(description="Advice for the user on how to read the subtext and what to 'signal' in their next response.")
    suggested_strategies: List[str] = dspy.OutputField(description="3 ways to reply: 1. The Direct approach, 2. The Subtle Pivot, 3. The Power Move.")


class EQResponseEvaluator(dspy.Signature):
    """
    You are a Senior Behavioral Analyst.
    Your job is to analyze the user's response in a high-stakes meeting.
    You evaluate the 'Subtext', 'Status Management', and 'Strategic Alignment'.
    You tell the user if they 'lost face', 'held ground', or 'gained leverage'.
    """

    scenario_context: str = dspy.InputField(description="The immediate situation/setting the user responded to.")
    npc_last_statement: str = dspy.InputField(description="What the high-profile NPC said or did.")
    user_response: str = dspy.InputField(description="The actual words or actions the user just took.")
    learning_focus: str = dspy.InputField(description="The skill being practiced (e.g., 'Strategic Ambiguity').")

    subtext_accuracy: str = dspy.OutputField(description="Did the user correctly 'read' the NPC's hidden intent?")
    status_impact: str = dspy.OutputField(description="How the user's social/professional status changed (Increased, Maintained, Diminished, Completely Lost).")
    strategic_grade: str = dspy.OutputField(description="How well the response aligns with the meeting's long-term goal (A, B, C, D, F).")
    strengths: List[str] = dspy.OutputField(description="What the user did well in this specific turn.")
    critical_flaws: List[str] = dspy.OutputField(description="Technical or EQ mistakes (e.g., 'Too defensive', 'Gave away too much info').")
    the_rewritten_pro_move: str = dspy.OutputField(description="How a Master Negotiator would have said the exact same thing to get a better result.")
    coaching_tip: str = dspy.OutputField(description="A psychological tip for the next turn.")


class ExecutiveEQService:
    """Stateless business layer wrapping the DSPy executive EQ pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.7, cache=False)

    @staticmethod
    def _as_dict(raw: object) -> Dict[str, Any]:
        """
        Coerces a raw LLM value into a dictionary.

        Args:
            raw (object): The raw LLM output.

        Returns:
            Dict[str, Any]: The dictionary value.
        """
        return raw if isinstance(raw, dict) else {}

    @staticmethod
    def _coerce_list(value: object) -> List[str]:
        """
        Coerces a raw value into a list of strings.

        Args:
            value (object): The raw LLM output.

        Returns:
            List[str]: The list value.
        """
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value]
        return [str(value)]

    @staticmethod
    def _coerce_str(value: object, default: str = "") -> str:
        """
        Coerces a raw value into a string.

        Args:
            value (object): The raw LLM output.
            default (str): Fallback value.

        Returns:
            str: The coerced string.
        """
        if value is None:
            return default
        return str(value)

    @staticmethod
    def _pick(value: object, allowed: tuple, default: str) -> str:
        """
        Returns a value if it belongs to the allowed set (case-insensitive), else a default.

        Args:
            value (object): The raw LLM output.
            allowed (tuple): Allowed string values.
            default (str): Fallback value.

        Returns:
            str: A normalized enum-style string.
        """
        candidate = str(value).strip().lower()
        for option in allowed:
            if option.lower() == candidate:
                return option
        return default

    async def generate_scenario(self, data: ScenarioRequest) -> ScenarioResponse:
        """
        Builds the simulation's foundation: setting, stakes, and NPC profile.

        Args:
            data (ScenarioRequest): The validated request.

        Returns:
            ScenarioResponse: The scenario foundation.

        Raises:
            GenerationError: If the generation pipeline fails.
        """
        try:
            result = run_predictor(
                HighStakesScenarioGenerator,
                self.lm,
                user_role=data.user_role,
                narrative_arc=data.narrative_arc,
                learning_focus=data.learning_focus,
                difficulty_level=data.difficulty_level,
                industry_context=data.industry_context or "",
            )
            logger.info("Generated EQ scenario for role '%s'", data.user_role)
            return ScenarioResponse(
                scenario_title=self._coerce_str(result.scenario_title),
                setting_description=self._coerce_str(result.setting_description),
                npc_profile=self._as_dict(result.npc_profile),
                initial_stakes=self._coerce_str(result.initial_stakes),
                opening_hook=self._coerce_str(result.opening_hook),
            )
        except Exception as exc:
            logger.error("Scenario generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def run_training_loop(self, data: TurnRequest) -> TurnResponse:
        """
        Generates the NPC's next move and coaching advice for the current turn.

        Args:
            data (TurnRequest): The validated request.

        Returns:
            TurnResponse: The NPC's move and EQ coaching.

        Raises:
            GenerationError: If the training loop pipeline fails.
        """
        try:
            result = run_predictor(
                HighProfileEQTrainer,
                self.lm,
                previous_scenario=data.previous_scenario or "",
                narrative_arc=data.narrative_arc,
                chat_history=[{"role": message.role, "content": message.content} for message in data.chat_history],
                learning_focus=data.learning_focus,
                seed=data.seed,
                user_customization=data.user_customization or "",
            )
            logger.info("Ran training loop turn for focus '%s'", data.learning_focus)
            return TurnResponse(
                rationale=self._coerce_str(result.rationale),
                meeting_scenario=self._coerce_str(result.meeting_scenario),
                npc_dialogue=self._coerce_str(result.npc_dialogue),
                eq_coach_message=self._coerce_str(result.eq_coach_message),
                suggested_strategies=self._coerce_list(result.suggested_strategies),
            )
        except Exception as exc:
            logger.error("Training loop turn failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def evaluate_move(self, data: EvaluateRequest) -> EvaluateResponse:
        """
        Grades the user's response against the NPC's move.

        Args:
            data (EvaluateRequest): The validated request.

        Returns:
            EvaluateResponse: The behavioral analysis.

        Raises:
            GenerationError: If the evaluation pipeline fails.
        """
        try:
            result = run_predictor(
                EQResponseEvaluator,
                self.lm,
                scenario_context=data.scenario_context,
                npc_last_statement=data.npc_last_statement,
                user_response=data.user_response,
                learning_focus=data.learning_focus,
            )
            logger.info("Evaluated user response for focus '%s'", data.learning_focus)
            return EvaluateResponse(
                subtext_accuracy=self._coerce_str(result.subtext_accuracy),
                status_impact=self._pick(
                    result.status_impact,
                    ("Increased", "Maintained", "Diminished", "Completely Lost"),
                    "Maintained",
                ),
                strategic_grade=self._pick(result.strategic_grade, ("A", "B", "C", "D", "F"), "C"),
                strengths=self._coerce_list(result.strengths),
                critical_flaws=self._coerce_list(result.critical_flaws),
                the_rewritten_pro_move=self._coerce_str(result.the_rewritten_pro_move),
                coaching_tip=self._coerce_str(result.coaching_tip),
            )
        except Exception as exc:
            logger.error("Response evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
