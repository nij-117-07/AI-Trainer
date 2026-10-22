import logging
from typing import List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.clarity_trainer.schemas import (
    BetterVersion,
    CoachFeedback,
    CommunicationScenario,
    EvaluateRequest,
    EvaluateResponse,
    GoldStandard,
    ResponseAnalysis,
    ScenarioRequest,
    ScenarioResponse,
)

logger = logging.getLogger(__name__)

DIFFICULTY_VALUES: tuple = ("easy", "medium", "hard", "advanced")
CATEGORY_VALUES: tuple = (
    "team update",
    "giving feedback",
    "difficult conversation",
    "pitch or ask",
    "status report",
    "conflict resolution",
    "presentation opening",
    "email",
    "negotiation",
    "apology",
)
VERBOSITY_VALUES: tuple = ("concise", "moderate", "verbose", "redundant")
CLARITY_VALUES: tuple = ("excellent", "good", "fair", "poor")


class ClarityTrainerError(Exception):
    """Base exception for all clarity trainer failures."""


class GenerationError(ClarityTrainerError):
    """Raised when a DSPy pipeline fails to produce content."""


class ScenarioGenerator(dspy.Signature):
    """
    You are a Communication Scenario Designer.
    Generate realistic, engaging scenarios where the user must practice
    speaking clearly and concisely.

    Scenarios should be:
    - Grounded in real workplace/life situations
    - Have clear stakes and participants
    - Challenge the user to be direct without being blunt
    - Vary in difficulty and category
    """

    difficulty: Optional[Literal["easy", "medium", "hard", "advanced"]] = dspy.InputField(
        default=None,
        description="Desired difficulty: easy, medium, hard, advanced. Random if None.",
    )
    category: Optional[Literal["team update", "giving feedback", "difficult conversation", "pitch or ask", "status report", "conflict resolution", "presentation opening", "email", "negotiation", "apology"]] = dspy.InputField(
        default=None,
        description="Desired scenario type. Random if None.",
    )
    user_context: Optional[str] = dspy.InputField(
        default=None,
        description="User's role or industry (e.g., 'software engineer', 'manager').",
    )

    scenario_title: str = dspy.OutputField(
        description="Short, punchy title for the scenario."
    )
    situation: str = dspy.OutputField(
        description="A vivid description of the situation (2-4 sentences). Set the scene."
    )
    characters: List[str] = dspy.OutputField(
        description="List of people involved and their roles (e.g., 'You (project lead)', 'Alex (skeptical stakeholder)')."
    )
    your_goal: str = dspy.OutputField(
        description="What the user needs to achieve in this conversation."
    )
    constraints: List[str] = dspy.OutputField(
        description="Specific challenges or rules (e.g., 'Must happen in under 60 seconds', 'Stakeholder is impatient')."
    )
    prompt_to_user: str = dspy.OutputField(
        description="The question posed to the user. E.g., 'What do you say to open this conversation?'"
    )
    ideal_length_seconds: int = dspy.OutputField(
        description="Estimated ideal response time in seconds. Use this to gauge conciseness."
    )
    difficulty_assigned: Literal["easy", "medium", "hard", "advanced"] = dspy.OutputField(
        description="Actual difficulty of this scenario."
    )


class MessageAnalyzer(dspy.Signature):
    """
    You are a Communication Analyzer. Evaluate how well the user's response
    fits the given scenario, focusing on brevity, clarity, and effectiveness.
    """

    scenario_title: str = dspy.InputField(
        description="Title of the scenario they're responding to."
    )
    situation: str = dspy.InputField(
        description="The situation they were responding to."
    )
    your_goal: str = dspy.InputField(
        description="What they needed to achieve."
    )
    user_response: str = dspy.InputField(
        description="The user's actual response."
    )

    verbosity_level: Literal["concise", "moderate", "verbose", "redundant"] = dspy.OutputField(
        description="How verbose the response is."
    )
    word_count: int = dspy.OutputField(
        description="Total word count."
    )
    filler_words: List[str] = dspy.OutputField(
        description="Filler or weak words detected."
    )
    redundant_phrases: List[str] = dspy.OutputField(
        description="Repeated ideas or phrases."
    )
    clarity_score: Literal["excellent", "good", "fair", "poor"] = dspy.OutputField(
        description="How clear and direct it is."
    )
    goal_achievement: float = dspy.OutputField(
        description="How well the response achieves the stated goal (0 to 1)."
    )
    tone_appropriateness: float = dspy.OutputField(
        description="How appropriate the tone is for the scenario (0 to 1)."
    )
    core_message: str = dspy.OutputField(
        description="The single most important point in the response."
    )
    scenario_fit_note: str = dspy.OutputField(
        description="One sentence on whether the response fits the scenario context."
    )


class CriticCoach(dspy.Signature):
    """
    You are a direct, honest Communication Coach.
    Evaluate the user's response to a specific scenario.
    Give structured, actionable feedback.
    """

    scenario_title: str = dspy.InputField(
        description="Title of the scenario."
    )
    situation: str = dspy.InputField(
        description="The situation."
    )
    user_response: str = dspy.InputField(
        description="What the user said."
    )
    analysis_summary: str = dspy.InputField(
        description="Summary of analysis (verbosity, clarity, goal achievement, tone, fillers)."
    )

    quality_score: int = dspy.OutputField(
        description="Overall quality score (1-10)."
    )
    what_worked: List[str] = dspy.OutputField(
        description="Up to 3 things done well."
    )
    what_to_cut: List[str] = dspy.OutputField(
        description="Specific phrases or patterns to remove next time."
    )
    what_to_add: List[str] = dspy.OutputField(
        description="Up to 2 missing elements that would make this stronger."
    )
    rewrite_suggestion: str = dspy.OutputField(
        description="One sentence showing exactly how to make it punchier."
    )
    one_principle: str = dspy.OutputField(
        description="A single principle to remember for this type of situation."
    )
    coach_message: str = dspy.OutputField(
        description="Direct, encouraging coach feedback (2-4 sentences)."
    )


class ConciseRewriter(dspy.Signature):
    """
    You are a precision rewriter. Rewrite the user's response to be
    clear, concise, and high-impact while preserving intent and tone.
    Target at least 25% reduction in word count.
    """

    scenario_context: str = dspy.InputField(
        description="Situation and goal for context."
    )
    user_response: str = dspy.InputField(
        description="The user's original response."
    )
    core_message: str = dspy.InputField(
        description="The main point to preserve."
    )

    rewritten_response: str = dspy.OutputField(
        description="The improved, concise version."
    )
    original_words: int = dspy.OutputField(
        description="Word count of original."
    )
    new_words: int = dspy.OutputField(
        description="Word count of rewrite."
    )
    percent_cut: float = dspy.OutputField(
        description="Percentage of words removed."
    )
    why_better: List[str] = dspy.OutputField(
        description="2-3 reasons why this version is more effective."
    )


class IdealResponseGenerator(dspy.Signature):
    """
    You are a Master Communicator. Generate the ideal response to this scenario
    as if given by someone who excels at speaking less and saying more.
    This is the gold standard for the user to learn from.
    """

    scenario_title: str = dspy.InputField(
        description="Scenario title."
    )
    situation: str = dspy.InputField(
        description="The situation."
    )
    your_goal: str = dspy.InputField(
        description="What to achieve."
    )
    constraints: List[str] = dspy.InputField(
        description="Specific constraints to address."
    )

    ideal_opening: str = dspy.OutputField(
        description="The perfect first sentence/line."
    )
    ideal_full_response: str = dspy.OutputField(
        description="The full ideal response (what would actually be said)."
    )
    why_ideal: List[str] = dspy.OutputField(
        description="3 reasons this response is ideal."
    )
    word_count: int = dspy.OutputField(
        description="Word count of the ideal response."
    )
    estimated_seconds: int = dspy.OutputField(
        description="How long this takes to speak (seconds)."
    )


class ClarityTrainerService:
    """Stateless business layer orchestrating the DSPy clarity training components."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, stop=None, cache=False)

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
        Coerces a raw value into a non-negative integer.

        Args:
            value (object): The raw LLM output.
            default (int): Fallback value.

        Returns:
            int: A non-negative integer.
        """
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return default
        return max(0, parsed)

    @staticmethod
    def _coerce_float(value: object, default: float = 0.0, high: float = 1.0) -> float:
        """
        Coerces a raw value into a float clamped to [0, high].

        Args:
            value (object): The raw LLM output.
            default (float): Fallback value.
            high (float): Upper bound for clamping.

        Returns:
            float: A clamped float.
        """
        try:
            parsed = float(value)
        except (TypeError, ValueError):
            return default
        return max(0.0, min(high, parsed))

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
    def _build_scenario(cls, result: object) -> CommunicationScenario:
        """
        Normalizes raw DSPy scenario output into a CommunicationScenario model.

        Args:
            result (object): The DSPy ScenarioGenerator prediction.

        Returns:
            CommunicationScenario: The validated scenario model.
        """
        return CommunicationScenario(
            title=str(getattr(result, "scenario_title", "")),
            situation=str(getattr(result, "situation", "")),
            characters=cls._coerce_list(getattr(result, "characters", [])),
            goal=str(getattr(result, "your_goal", "")),
            constraints=cls._coerce_list(getattr(result, "constraints", [])),
            prompt_to_user=str(getattr(result, "prompt_to_user", "")),
            ideal_length_seconds=cls._coerce_int(getattr(result, "ideal_length_seconds", 0)),
            difficulty=cls._pick(
                getattr(result, "difficulty_assigned", "medium"),
                DIFFICULTY_VALUES,
                "medium",
            ),
        )

    @classmethod
    def _build_analysis(cls, result: object) -> ResponseAnalysis:
        """
        Normalizes raw DSPy analyzer output into a ResponseAnalysis model.

        Args:
            result (object): The DSPy MessageAnalyzer prediction.

        Returns:
            ResponseAnalysis: The validated analysis model.
        """
        return ResponseAnalysis(
            verbosity=cls._pick(
                getattr(result, "verbosity_level", "moderate"),
                VERBOSITY_VALUES,
                "moderate",
            ),
            word_count=cls._coerce_int(getattr(result, "word_count", 0)),
            filler_words=cls._coerce_list(getattr(result, "filler_words", [])),
            redundant_phrases=cls._coerce_list(getattr(result, "redundant_phrases", [])),
            clarity=cls._pick(
                getattr(result, "clarity_score", "good"),
                CLARITY_VALUES,
                "good",
            ),
            goal_achievement=cls._coerce_float(getattr(result, "goal_achievement", 0.5)),
            tone_fit=cls._coerce_float(getattr(result, "tone_appropriateness", 0.5)),
            core_message=str(getattr(result, "core_message", "")),
            scenario_fit_note=str(getattr(result, "scenario_fit_note", "")),
        )

    @classmethod
    def _build_feedback(cls, result: object) -> CoachFeedback:
        """
        Normalizes raw DSPy coach output into a CoachFeedback model.

        Args:
            result (object): The DSPy CriticCoach prediction.

        Returns:
            CoachFeedback: The validated feedback model.
        """
        score = cls._coerce_int(getattr(result, "quality_score", 5), default=5)
        return CoachFeedback(
            score=max(1, min(10, score)),
            what_worked=cls._coerce_list(getattr(result, "what_worked", [])),
            what_to_cut=cls._coerce_list(getattr(result, "what_to_cut", [])),
            what_to_add=cls._coerce_list(getattr(result, "what_to_add", [])),
            rewrite_suggestion=str(getattr(result, "rewrite_suggestion", "")),
            one_principle=str(getattr(result, "one_principle", "")),
            coach_message=str(getattr(result, "coach_message", "")),
        )

    @classmethod
    def _build_better_version(cls, result: object) -> BetterVersion:
        """
        Normalizes raw DSPy rewriter output into a BetterVersion model.

        Args:
            result (object): The DSPy ConciseRewriter prediction.

        Returns:
            BetterVersion: The validated rewrite model.
        """
        return BetterVersion(
            rewritten=str(getattr(result, "rewritten_response", "")),
            original_words=cls._coerce_int(getattr(result, "original_words", 0)),
            new_words=cls._coerce_int(getattr(result, "new_words", 0)),
            percent_reduced=cls._coerce_float(getattr(result, "percent_cut", 0.0), high=100.0),
            why_better=cls._coerce_list(getattr(result, "why_better", [])),
        )

    @classmethod
    def _build_gold_standard(cls, result: object) -> GoldStandard:
        """
        Normalizes raw DSPy ideal-response output into a GoldStandard model.

        Args:
            result (object): The DSPy IdealResponseGenerator prediction.

        Returns:
            GoldStandard: The validated gold-standard model.
        """
        return GoldStandard(
            opening=str(getattr(result, "ideal_opening", "")),
            full_response=str(getattr(result, "ideal_full_response", "")),
            why_ideal=cls._coerce_list(getattr(result, "why_ideal", [])),
            word_count=cls._coerce_int(getattr(result, "word_count", 0)),
            seconds=cls._coerce_int(getattr(result, "estimated_seconds", 0)),
        )

    async def generate_scenario(self, data: ScenarioRequest) -> ScenarioResponse:
        """
        Generates a communication practice scenario.

        The scenario is persisted by the client's session/memory app and passed
        back with the subsequent evaluation request.

        Args:
            data (ScenarioRequest): The validated scenario request.

        Returns:
            ScenarioResponse: The generated scenario for the client to persist.

        Raises:
            GenerationError: If the scenario pipeline fails.
        """
        try:
            result = run_predictor(
                ScenarioGenerator,
                self.lm,
                difficulty=data.difficulty,
                category=data.category,
                user_context=data.user_context or "",
            )
            scenario = self._build_scenario(result)
            logger.info(
                "Generated '%s' communication scenario (difficulty=%s)",
                scenario.title,
                scenario.difficulty,
            )
            return ScenarioResponse(scenario=scenario)
        except Exception as exc:
            logger.error("Scenario generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def evaluate(self, data: EvaluateRequest) -> EvaluateResponse:
        """
        Runs the full clarity evaluation pipeline: analysis, coach feedback,
        concise rewrite, and gold-standard response.

        Args:
            data (EvaluateRequest): The validated evaluation request.

        Returns:
            EvaluateResponse: The analysis, feedback, rewrite, and gold standard.

        Raises:
            GenerationError: If any pipeline step fails.
        """
        try:
            analysis = run_predictor(
                MessageAnalyzer,
                self.lm,
                scenario_title=data.scenario.title,
                situation=data.scenario.situation,
                your_goal=data.scenario.goal,
                user_response=data.user_response,
            )

            analysis_summary = (
                f"Verbosity: {analysis.verbosity_level}, "
                f"Clarity: {analysis.clarity_score}, "
                f"Words: {analysis.word_count}, "
                f"Goal Achievement: {analysis.goal_achievement * 100:.0f}%, "
                f"Tone Fit: {analysis.tone_appropriateness * 100:.0f}%, "
                f"Fillers: {', '.join(analysis.filler_words) or 'none'}, "
                f"Core message: '{analysis.core_message}'. "
                f"Context fit: {analysis.scenario_fit_note}"
            )

            feedback = run_predictor(
                CriticCoach,
                self.lm,
                scenario_title=data.scenario.title,
                situation=data.scenario.situation,
                user_response=data.user_response,
                analysis_summary=analysis_summary,
            )

            scenario_context = (
                f"Situation: {data.scenario.situation}. "
                f"Goal: {data.scenario.goal}."
            )
            rewrite = run_predictor(
                ConciseRewriter,
                self.lm,
                scenario_context=scenario_context,
                user_response=data.user_response,
                core_message=analysis.core_message,
            )

            ideal = run_predictor(
                IdealResponseGenerator,
                self.lm,
                scenario_title=data.scenario.title,
                situation=data.scenario.situation,
                your_goal=data.scenario.goal,
                constraints=data.scenario.constraints,
            )

            logger.info("Evaluated response for scenario '%s'", data.scenario.title)
            return EvaluateResponse(
                scenario=data.scenario,
                user_response=data.user_response,
                analysis=self._build_analysis(analysis),
                feedback=self._build_feedback(feedback),
                better_version=self._build_better_version(rewrite),
                gold_standard=self._build_gold_standard(ideal),
            )
        except Exception as exc:
            logger.error("Clarity evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
