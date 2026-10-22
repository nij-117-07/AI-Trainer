import logging
from typing import Dict, List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.debate.schemas import (
    ArgumentPoint,
    DebateTurnRequest,
    DebateTurnResponse,
    JudgeRequest,
    JudgeResponse,
    PersonaRequest,
    PersonaResponse,
    PersonaProfile,
)

logger = logging.getLogger(__name__)

STANCE_VALUES: tuple = ("aggressive", "defensive", "moderate", "socratic")
SIDE_VALUES: tuple = ("pro", "con")
WINNER_VALUES: tuple = ("pro", "con", "tie")


class DebateError(Exception):
    """Base exception for all debate module failures."""


class GenerationError(DebateError):
    """Raised when a DSPy pipeline fails to produce content."""


class PersonaArchitect(dspy.Signature):
    """
    You are an expert Character Designer for AI Debaters.
    Transform character traits, intellectual influences, and debate context
    into a comprehensive System Prompt and strategic profile for a Debate AI.
    """

    character_archetype: str = dspy.InputField(desc="e.g., Cynical Academic, Aggressive Trial Lawyer, Zen Philosopher.")
    speech_style: str = dspy.InputField(desc="e.g., Sesquipedalian, punchy and short, metaphorical, data-driven.")
    rhetorical_intensity: int = dspy.InputField(desc="Scale 1-10 (1: Passive/Meditative, 10: High-stakes confrontation).")
    intellectual_influences: List[str] = dspy.InputField(desc="List of thinkers or schools of thought (e.g., ['Sartre', 'Game Theory']).")
    debate_topic: str = dspy.InputField(desc="The primary topic this persona is being built to debate.")
    side: Literal["pro", "con"] = dspy.InputField(desc="Must be 'pro' (In favor) or 'con' (Against).")
    custom_constraints: Optional[str] = dspy.InputField(desc="Any additional user quirks (e.g., 'Never uses emojis', 'Obsessed with maritime metaphors').")

    persona_name: str = dspy.OutputField(desc="A creative name for this specific persona.")
    system_prompt: str = dspy.OutputField(desc="The complete, formatted System Prompt defining the persona's voice, rules, and behavior.")
    overall_stance: Literal["aggressive", "defensive", "moderate", "socratic"] = dspy.OutputField(desc="The overarching rhetorical stance this persona will default to.")
    strategic_priorities: List[str] = dspy.OutputField(desc="The core logic the persona follows to 'win' a debate.")
    core_values: List[str] = dspy.OutputField(desc="The fundamental beliefs this persona will never compromise on.")
    linguistic_quirks: List[str] = dspy.OutputField(desc="Specific ways of speaking (e.g., uses Latin phrases, extremely formal).")


class DebateTurnGenerator(dspy.Signature):
    """
    You are an expert debater embodying a specific persona. Analyze the chat history,
    topic, and your assigned turn strategy to provide a logically sound, persuasive argument.
    You must strictly adhere to your persona's voice and strategic priorities.
    """

    system_prompt: str = dspy.InputField(desc="The persona definition and character rules.")
    debate_topic: str = dspy.InputField(desc="The core subject being debated.")
    debate_context: str = dspy.InputField(desc="General theme or background information for the debate.")
    chat_history: List[Dict[str, str]] = dspy.InputField(desc="Previous exchanges in the debate.")
    turn_strategy: Literal["attack", "defend", "counter"] = dspy.InputField(desc="The specific tactical goal for this turn.")
    external_evidence: Optional[str] = dspy.InputField(desc="Supporting facts or raw data to be used in the argument.")
    custom_instructions: Optional[str] = dspy.InputField(desc="Specific constraints like word count or emotional tone.")

    opponent_analysis: str = dspy.OutputField(desc="A brief, strategic analysis of the opponent's previous point and its weaknesses.")
    core_claim: str = dspy.OutputField(desc="The core assertion or claim for this turn.")
    reasoning_and_evidence: str = dspy.OutputField(desc="The logical explanation and supporting evidence/data for the claim.")
    spoken_argument: str = dspy.OutputField(desc="The actual persuasive response, written entirely in the persona's voice and style.")
    rhetorical_devices: List[str] = dspy.OutputField(desc="List of techniques used in the spoken argument (e.g., Ethos, Pathos, Logos, Reductio ad absurdum).")
    closing_question: str = dspy.OutputField(desc="A piercing, strategic question aimed at the opponent to pivot or press the advantage.")


class DebateJudge(dspy.Signature):
    """
    You are an impartial, highly analytical Debate Judge. Evaluate the quality
    of arguments from both sides based on logical strength, evidence, rhetorical
    effectiveness, and adherence to the debate topic.
    """

    debate_topic: str = dspy.InputField(desc="The original debate topic.")
    pro_transcript: str = dspy.InputField(desc="The full transcript of the Pro side's spoken arguments.")
    con_transcript: str = dspy.InputField(desc="The full transcript of the Con side's spoken arguments.")

    pro_score: int = dspy.OutputField(desc="Score from 0-10 for the Pro side.")
    con_score: int = dspy.OutputField(desc="Score from 0-10 for the Con side.")
    strongest_argument: Dict[str, str] = dspy.OutputField(desc="{'side': 'pro'/'con', 'claim': '...'} identifying the best point made.")
    weakest_argument: Dict[str, str] = dspy.OutputField(desc="{'side': 'pro'/'con', 'claim': '...'} identifying the most flawed point.")
    winner: Literal["pro", "con", "tie"] = dspy.OutputField(desc="The final verdict.")
    reasoning: str = dspy.OutputField(desc="Clear, detailed explanation of the verdict.")
    judge_comments: str = dspy.OutputField(desc="Constructive feedback and stylistic observations for both sides.")


class DebateService:
    """Business layer wrapping the DSPy debate pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.6, cache=False)

    @staticmethod
    def _coerce_list(value: object) -> List[str]:
        """
        Coerces a raw value into a list of strings.

        Args:
            value (object): The raw LLM output.

        Returns:
            List[str]: A normalized list of strings.
        """
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value]
        return [str(value)]

    @staticmethod
    def _coerce_int(value: object, default: int = 0) -> int:
        """
        Coerces a raw value into an integer.

        Args:
            value (object): The raw LLM output.
            default (int): Fallback value.

        Returns:
            int: The coerced integer.
        """
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _pick(value: object, allowed: tuple, default: str) -> str:
        """
        Returns a value if it belongs to the allowed set, else a default.

        Args:
            value (object): The raw LLM output.
            allowed (tuple): Allowed string values.
            default (str): Fallback value.

        Returns:
            str: A normalized enum-style string.
        """
        candidate = str(value).lower()
        return candidate if candidate in allowed else default

    @classmethod
    def _build_persona(cls, result: object) -> PersonaProfile:
        """
        Normalizes raw DSPy persona output into a PersonaProfile model.

        Args:
            result (object): The DSPy PersonaArchitect prediction.

        Returns:
            PersonaProfile: The validated persona profile.
        """
        return PersonaProfile(
            persona_name=str(getattr(result, "persona_name", "")),
            system_prompt=str(getattr(result, "system_prompt", "")),
            overall_stance=cls._pick(
                getattr(result, "overall_stance", "moderate"),
                STANCE_VALUES,
                "moderate",
            ),
            strategic_priorities=cls._coerce_list(getattr(result, "strategic_priorities", [])),
            core_values=cls._coerce_list(getattr(result, "core_values", [])),
            linguistic_quirks=cls._coerce_list(getattr(result, "linguistic_quirks", [])),
        )

    @classmethod
    def _build_argument_point(cls, raw: object) -> ArgumentPoint:
        """
        Normalizes a raw argument dict into an ArgumentPoint model.

        Args:
            raw (object): The raw argument dictionary from the LLM.

        Returns:
            ArgumentPoint: The validated argument point.
        """
        data = raw if isinstance(raw, dict) else {}
        return ArgumentPoint(
            side=cls._pick(data.get("side", "pro"), SIDE_VALUES, "pro"),
            claim=str(data.get("claim", "")),
        )

    async def create_persona(self, data: PersonaRequest) -> PersonaResponse:
        """
        Generates a specialized debate persona and system prompt.

        Args:
            data (PersonaRequest): The validated persona request.

        Returns:
            PersonaResponse: The generated persona profile.

        Raises:
            GenerationError: If the persona pipeline fails.
        """
        try:
            result = run_predictor(
                PersonaArchitect,
                self.lm,
                character_archetype=data.archetype,
                speech_style=data.style,
                rhetorical_intensity=data.intensity,
                intellectual_influences=data.influences,
                debate_topic=data.topic,
                side=data.side,
                custom_constraints=data.custom_constraints or "None",
            )
            persona = self._build_persona(result)
            logger.info("Created debate persona '%s'", persona.persona_name)
            return PersonaResponse(persona=persona)
        except Exception as exc:
            logger.error("Persona creation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def execute_turn(self, data: DebateTurnRequest) -> DebateTurnResponse:
        """
        Executes a single debate turn for a given persona.

        Args:
            data (DebateTurnRequest): The validated turn request.

        Returns:
            DebateTurnResponse: The generated argument and rebuttal.

        Raises:
            GenerationError: If the turn pipeline fails.
        """
        try:
            result = run_predictor(
                DebateTurnGenerator,
                self.lm,
                system_prompt=data.system_prompt,
                debate_topic=data.topic,
                debate_context=data.context or "General debate",
                chat_history=data.history,
                turn_strategy=data.strategy,
                external_evidence=data.evidence,
                custom_instructions=data.instructions,
            )
            logger.info("Executed %s turn on topic '%s'", data.strategy, data.topic)
            return DebateTurnResponse(
                opponent_analysis=result.opponent_analysis,
                core_claim=result.core_claim,
                reasoning_and_evidence=result.reasoning_and_evidence,
                spoken_argument=result.spoken_argument,
                rhetorical_devices=self._coerce_list(result.rhetorical_devices),
                closing_question=result.closing_question,
            )
        except Exception as exc:
            logger.error("Debate turn failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def judge_debate(self, data: JudgeRequest) -> JudgeResponse:
        """
        Judges a completed debate transcript and returns a verdict.

        Args:
            data (JudgeRequest): The validated judge request.

        Returns:
            JudgeResponse: The scores, verdict, and judge feedback.

        Raises:
            GenerationError: If the judge pipeline fails.
        """
        try:
            result = run_predictor(
                DebateJudge,
                self.lm,
                debate_topic=data.topic,
                pro_transcript=data.pro_transcript,
                con_transcript=data.con_transcript,
            )
            pro_score = max(0, min(10, self._coerce_int(result.pro_score, default=5)))
            con_score = max(0, min(10, self._coerce_int(result.con_score, default=5)))
            logger.info("Judged debate on topic '%s' (winner=%s)", data.topic, result.winner)
            return JudgeResponse(
                pro_score=pro_score,
                con_score=con_score,
                strongest_argument=self._build_argument_point(result.strongest_argument),
                weakest_argument=self._build_argument_point(result.weakest_argument),
                winner=self._pick(result.winner, WINNER_VALUES, "tie"),
                reasoning=result.reasoning,
                judge_comments=result.judge_comments,
            )
        except Exception as exc:
            logger.error("Debate judging failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
