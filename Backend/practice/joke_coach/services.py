import logging
from typing import Any, Dict, List

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.joke_coach.schemas import (
    ClassifyJokeRequest,
    ClassifyJokeResponse,
    CrowdSimulationRequest,
    CrowdSimulationResponse,
    EvaluateJokeRequest,
    EvaluateJokeResponse,
    GenerateJokeRequest,
    GenerateJokeResponse,
    PracticeCoachRequest,
    PracticeCoachResponse,
    RewriteJokeRequest,
    RewriteJokeResponse,
)

logger = logging.getLogger(__name__)


class JokeCoachError(Exception):
    """Base exception for all joke coach module failures."""


class GenerationError(JokeCoachError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class JokeGenerator(dspy.Signature):
    """
    You are a Joke Generator. Your role is to create original, entertaining jokes
    based on the given topic, style preferences, and target audience.
    """

    topic: str = dspy.InputField(description="The subject or theme for the joke (e.g., 'programming', 'cats', 'coffee').")
    joke_style: str = dspy.InputField(
        default="dad-joke",
        description="Preferred joke format or style (pun, one-liner, story, observational, dad-joke).",
    )
    audience: str = dspy.InputField(description="Target audience (e.g., 'kids', 'adults', 'professionals').")

    joke: str = dspy.OutputField(description="The generated joke text.")
    setup: str = dspy.OutputField(description="The setup/premise of the joke (if applicable).")
    punchline: str = dspy.OutputField(description="The punchline or payoff of the joke.")
    humor_type: str = dspy.OutputField(description="Type of humor used (wordplay, irony, exaggeration, etc.).")
    difficulty_rating: int = dspy.OutputField(description="Delivery difficulty on scale 1-5 (1=easy, 5=advanced timing needed).")


class JokeEvaluator(dspy.Signature):
    """
    You are a Joke Evaluator. Analyze the provided joke and give structured feedback
    on quality, timing, appropriateness, and suggest improvements.
    """

    joke: str = dspy.InputField(description="The complete joke text to evaluate.")
    intended_audience: str = dspy.InputField(description="Who this joke was meant for.")
    context: str = dspy.InputField(default="", description="Additional context (e.g., 'open mic night', 'family dinner', 'comedy club').")

    overall_score: float = dspy.OutputField(description="Overall quality score from 0.0 to 10.0.")
    humor_score: float = dspy.OutputField(description="How funny it is (0.0-10.0).")
    originality_score: float = dspy.OutputField(description="How original/creative it is (0.0-10.0).")
    delivery_score: float = dspy.OutputField(description="How easy it would be to deliver well (0.0-10.0).")
    appropriateness: str = dspy.OutputField(
        description="Content appropriateness level: all-ages, teen, mature, or nsfw."
    )
    strengths: List[str] = dspy.OutputField(description="List of what works well in this joke.")
    weaknesses: List[str] = dspy.OutputField(description="List of areas for improvement.")
    feedback: str = dspy.OutputField(description="Detailed constructive feedback paragraph.")
    is_recommended: bool = dspy.OutputField(description="Whether this joke is ready to perform.")


class JokeRewriter(dspy.Signature):
    """
    You are a Joke Rewriter. Take an existing joke and rewrite it to be funnier,
    sharper, or better suited for the specified context. Maintain the core premise
    while enhancing delivery, timing, and impact.
    """

    original_joke: str = dspy.InputField(description="The original joke text to improve.")
    improvement_goal: str = dspy.InputField(
        description="What aspect to improve (funnier, cleaner, shorter, more-clever, better-timing)."
    )
    target_audience: str = dspy.InputField(description="Who should find this funny.")

    rewritten_joke: str = dspy.OutputField(description="The improved version of the joke.")
    setup: str = dspy.OutputField(description="New setup/premise.")
    punchline: str = dspy.OutputField(description="New punchline.")
    changes_made: List[str] = dspy.OutputField(description="List of specific improvements made.")
    performance_notes: str = dspy.OutputField(description="Tips for delivering this joke effectively.")


class JokeClassifier(dspy.Signature):
    """
    You are a Joke Classifier. Analyze a joke and categorize it by style, structure,
    humor mechanism, and difficulty. This helps organize jokes for practice sessions.
    """

    joke: str = dspy.InputField(description="The joke text to classify.")

    style: str = dspy.OutputField(description="""
        Primary joke style: pun, one-liner, story-joke, observational, self-deprecating,
        dad-joke, dark-humor, or anti-joke.
    """)
    humor_mechanism: str = dspy.OutputField(description="""
        How the humor works: wordplay, misdirection, exaggeration, irony, rule-of-three,
        callback, or subversion.
    """)
    structure: str = dspy.OutputField(description="Structural breakdown (setup -> turn -> punchline).")
    tags: List[str] = dspy.OutputField(description="Relevant tags for categorization.")
    practice_category: str = dspy.OutputField(
        description="Suggested practice level based on complexity: beginner, intermediate, or advanced."
    )
    similar_joke_styles: List[str] = dspy.OutputField(description="Other styles this joke resembles.")


class PracticeCoach(dspy.Signature):
    """
    You are a Comedy Practice Coach. Guide users through a structured joke practice
    session. Provide exercises, feedback prompts, and help them improve their delivery
    and joke-writing skills.
    """

    current_skill_level: str = dspy.InputField(description="User's current comedy skill level: beginner, intermediate, or advanced.")
    practice_focus: str = dspy.InputField(description="Area to focus on: writing, delivery, timing, crowd-work, stage-presence, or all.")
    user_joke: str = dspy.InputField(default="", description="User's joke to practice with.")
    session_goal: str = dspy.InputField(description="What the user wants to achieve in this practice session.")

    exercise_type: str = dspy.OutputField(description="Recommended exercise type.")
    exercise_instructions: str = dspy.OutputField(description="Step-by-step instructions for the exercise.")
    practice_joke: str = dspy.OutputField(description="A joke to practice with (if user didn't provide one).")
    drill_prompt: str = dspy.OutputField(description="Specific drill or prompt for immediate practice.")
    success_criteria: List[str] = dspy.OutputField(description="How to know if the practice was successful.")
    next_steps: List[str] = dspy.OutputField(description="Recommended next practice steps.")


class CrowdResponseSimulator(dspy.Signature):
    """
    You are a Crowd Response Simulator. Predict how different audiences might react
    to a given joke. This helps comedians understand potential reception before
    performing.
    """

    joke: str = dspy.InputField(description="The joke to simulate responses for.")
    venue_type: str = dspy.InputField(description="Type of venue: comedy-club, open-mic, corporate-event, family-gathering, or college-show.")
    audience_demographic: str = dspy.InputField(description="Description of the expected audience.")

    predicted_response: str = dspy.OutputField(description="""
        Expected crowd reaction level: huge-laugh, solid-laugh, chuckles, polite-smile,
        silence, or groan.
    """)
    laugh_probability: float = dspy.OutputField(description="Probability of getting laughs (0.0-1.0).")
    best_delivery_style: str = dspy.OutputField(description="Recommended delivery approach.")
    potential_risks: List[str] = dspy.OutputField(description="What could go wrong with this joke.")
    alternative_punchline: str = dspy.OutputField(description="Backup punchline if the main one fails.")
    crowd_work_opportunity: str = dspy.OutputField(description="How to engage the crowd around this joke.")


class JokeCoachService:
    """Stateless business layer wrapping the DSPy joke practice pipelines."""

    def __init__(self) -> None:
        self.lms: Dict[float, dspy.LM] = {
            temperature: build_lm(temperature=temperature, cache=False)
            for temperature in (0.8, 0.6, 0.5, 0.4, 0.3, 0.2)
        }

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
    def _coerce_float(value: object, default: float = 5.0, high: float = 10.0) -> float:
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
    def _coerce_int(value: object, default: int = 3) -> int:
        """
        Coerces a raw value into an integer clamped to [1, 5].

        Args:
            value (object): The raw LLM output.
            default (int): Fallback value.

        Returns:
            int: A clamped integer.
        """
        try:
            parsed = int(float(value))
        except (TypeError, ValueError):
            return default
        return max(1, min(5, parsed))

    @staticmethod
    def _coerce_bool(value: object) -> bool:
        """
        Coerces a raw value into a boolean.

        Args:
            value (object): The raw LLM output.

        Returns:
            bool: The coerced boolean.
        """
        if isinstance(value, bool):
            return value
        return str(value).strip().lower() in ("true", "1", "yes", "y")

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
        candidate = str(value).strip().lower()
        return candidate if candidate in allowed else default

    async def generate_joke(self, data: GenerateJokeRequest) -> GenerateJokeResponse:
        """
        Generates a new joke for the given topic, style, and audience.

        Args:
            data (GenerateJokeRequest): The validated request.

        Returns:
            GenerateJokeResponse: The generated joke and metadata.

        Raises:
            GenerationError: If the generation pipeline fails.
        """
        try:
            result = run_predictor(
                JokeGenerator,
                self.lms[0.8],
                topic=data.topic,
                joke_style=data.joke_style,
                audience=data.audience,
            )
            logger.info("Generated joke on topic '%s'", data.topic)
            return GenerateJokeResponse(
                joke=self._coerce_str(result.joke),
                setup=self._coerce_str(result.setup),
                punchline=self._coerce_str(result.punchline),
                humor_type=self._coerce_str(result.humor_type),
                difficulty_rating=self._coerce_int(result.difficulty_rating),
            )
        except Exception as exc:
            logger.error("Joke generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def evaluate_joke(self, data: EvaluateJokeRequest) -> EvaluateJokeResponse:
        """
        Evaluates a joke and returns structured feedback.

        Args:
            data (EvaluateJokeRequest): The validated request.

        Returns:
            EvaluateJokeResponse: The scores and feedback.

        Raises:
            GenerationError: If the evaluation pipeline fails.
        """
        try:
            result = run_predictor(
                JokeEvaluator,
                self.lms[0.3],
                joke=data.joke,
                intended_audience=data.intended_audience,
                context=data.context or "",
            )
            logger.info("Evaluated a joke for audience '%s'", data.intended_audience)
            return EvaluateJokeResponse(
                overall_score=self._coerce_float(result.overall_score, default=5.0, high=10.0),
                humor_score=self._coerce_float(result.humor_score, default=5.0, high=10.0),
                originality_score=self._coerce_float(result.originality_score, default=5.0, high=10.0),
                delivery_score=self._coerce_float(result.delivery_score, default=5.0, high=10.0),
                appropriateness=self._pick(
                    result.appropriateness,
                    ("all-ages", "teen", "mature", "nsfw"),
                    "teen",
                ),
                strengths=self._coerce_list(result.strengths),
                weaknesses=self._coerce_list(result.weaknesses),
                feedback=self._coerce_str(result.feedback),
                is_recommended=self._coerce_bool(result.is_recommended),
            )
        except Exception as exc:
            logger.error("Joke evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def rewrite_joke(self, data: RewriteJokeRequest) -> RewriteJokeResponse:
        """
        Rewrites a joke to improve the requested aspect.

        Args:
            data (RewriteJokeRequest): The validated request.

        Returns:
            RewriteJokeResponse: The improved joke and changes.

        Raises:
            GenerationError: If the rewrite pipeline fails.
        """
        try:
            result = run_predictor(
                JokeRewriter,
                self.lms[0.6],
                original_joke=data.original_joke,
                improvement_goal=data.improvement_goal,
                target_audience=data.target_audience,
            )
            logger.info("Rewrote a joke for goal '%s'", data.improvement_goal)
            return RewriteJokeResponse(
                rewritten_joke=self._coerce_str(result.rewritten_joke),
                setup=self._coerce_str(result.setup),
                punchline=self._coerce_str(result.punchline),
                changes_made=self._coerce_list(result.changes_made),
                performance_notes=self._coerce_str(result.performance_notes),
            )
        except Exception as exc:
            logger.error("Joke rewrite failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def classify_joke(self, data: ClassifyJokeRequest) -> ClassifyJokeResponse:
        """
        Classifies a joke by style, mechanism, structure, and difficulty.

        Args:
            data (ClassifyJokeRequest): The validated request.

        Returns:
            ClassifyJokeResponse: The categorization result.

        Raises:
            GenerationError: If the classification pipeline fails.
        """
        try:
            result = run_predictor(
                JokeClassifier,
                self.lms[0.2],
                joke=data.joke,
            )
            logger.info("Classified a joke")
            return ClassifyJokeResponse(
                style=self._pick(
                    result.style,
                    ("pun", "one-liner", "story-joke", "observational", "self-deprecating", "dad-joke", "dark-humor", "anti-joke"),
                    "observational",
                ),
                humor_mechanism=self._pick(
                    result.humor_mechanism,
                    ("wordplay", "misdirection", "exaggeration", "irony", "rule-of-three", "callback", "subversion"),
                    "wordplay",
                ),
                structure=self._coerce_str(result.structure),
                tags=self._coerce_list(result.tags),
                practice_category=self._pick(result.practice_category, ("beginner", "intermediate", "advanced"), "beginner"),
                similar_joke_styles=self._coerce_list(result.similar_joke_styles),
            )
        except Exception as exc:
            logger.error("Joke classification failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def practice_session(self, data: PracticeCoachRequest) -> PracticeCoachResponse:
        """
        Generates a structured joke practice session.

        Args:
            data (PracticeCoachRequest): The validated request.

        Returns:
            PracticeCoachResponse: The exercise and next steps.

        Raises:
            GenerationError: If the coaching pipeline fails.
        """
        try:
            result = run_predictor(
                PracticeCoach,
                self.lms[0.5],
                current_skill_level=data.current_skill_level,
                practice_focus=data.practice_focus,
                user_joke=data.user_joke or "",
                session_goal=data.session_goal,
            )
            logger.info("Generated practice session for focus '%s'", data.practice_focus)
            return PracticeCoachResponse(
                exercise_type=self._coerce_str(result.exercise_type),
                exercise_instructions=self._coerce_str(result.exercise_instructions),
                practice_joke=self._coerce_str(result.practice_joke) or None,
                drill_prompt=self._coerce_str(result.drill_prompt),
                success_criteria=self._coerce_list(result.success_criteria),
                next_steps=self._coerce_list(result.next_steps),
            )
        except Exception as exc:
            logger.error("Practice session generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def simulate_crowd(self, data: CrowdSimulationRequest) -> CrowdSimulationResponse:
        """
        Simulates crowd response to a joke for a given venue and audience.

        Args:
            data (CrowdSimulationRequest): The validated request.

        Returns:
            CrowdSimulationResponse: The predicted reaction and risks.

        Raises:
            GenerationError: If the simulation pipeline fails.
        """
        try:
            result = run_predictor(
                CrowdResponseSimulator,
                self.lms[0.4],
                joke=data.joke,
                venue_type=data.venue_type,
                audience_demographic=data.audience_demographic,
            )
            logger.info("Simulated crowd response for venue '%s'", data.venue_type)
            return CrowdSimulationResponse(
                predicted_response=self._pick(
                    result.predicted_response,
                    ("huge-laugh", "solid-laugh", "chuckles", "polite-smile", "silence", "groan"),
                    "chuckles",
                ),
                laugh_probability=self._coerce_float(result.laugh_probability, default=0.5, high=1.0),
                best_delivery_style=self._coerce_str(result.best_delivery_style),
                potential_risks=self._coerce_list(result.potential_risks),
                alternative_punchline=self._coerce_str(result.alternative_punchline) or None,
                crowd_work_opportunity=self._coerce_str(result.crowd_work_opportunity),
            )
        except Exception as exc:
            logger.error("Crowd simulation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
