import logging
from typing import Dict, List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.negotiation.schemas import (
    AnalyzeMessageRequest,
    AnalyzeMessageResponse,
    CategoryScores,
    ChatMessage,
    EvaluateSessionRequest,
    EvaluateSessionResponse,
    InternalPosition,
    MessageAnalysis,
    NegotiationScenario,
    NegotiationTurnRequest,
    NegotiationTurnResponse,
    OpponentTurnRequest,
    OpponentTurnResponse,
    ScenarioRequest,
    ScenarioResponse,
)

logger = logging.getLogger(__name__)


class NegotiationError(Exception):
    """Base exception for all negotiation practice failures."""


class GenerationError(NegotiationError):
    """Raised when a DSPy pipeline fails to produce content."""


class ScenarioGenerator(dspy.Signature):
    """
    You are a Negotiation Scenario Creator. Your job is to generate realistic,
    engaging negotiation scenarios for practice. Each scenario should include
    clear roles, conflicting interests, and enough context for both parties
    to have a meaningful discussion.
    """

    difficulty: Literal["beginner", "intermediate", "advanced"] = dspy.InputField(
        description="Difficulty level of the practice scenario."
    )
    domain: str = dspy.InputField(
        description="Domain of negotiation (e.g., 'salary', 'real estate', 'business deal', 'diplomatic')."
    )

    scenario: Dict = dspy.OutputField(
        description="""
        A dictionary containing:
        - 'title': A catchy scenario title
        - 'context': Background situation description (2-3 sentences)
        - 'your_role': The practice user's role/title
        - 'your_goal': What the user wants to achieve
        - 'your_constraints': Limits or restrictions the user faces
        - 'opponent_role': The AI opponent's role/title
        - 'opponent_goal': What the opponent wants to achieve
        - 'opponent_constraints': Limits the opponent faces
        - 'key_issues': List of 2-4 negotiable items/topics
        - 'starting_stance_opponent': How the opponent should open (first message)
        """
    )


class OpponentResponse(dspy.Signature):
    """
    You are playing the role of a negotiation counterparty. Stay in character
    based on the scenario details provided. Your goal is to represent the
    opponent's interests realistically — be cooperative but also advocate for
    their position. Do NOT reveal hidden constraints unless strategically
    appropriate during the negotiation.
    """

    scenario_context: str = dspy.InputField(
        description="Full scenario background and roles."
    )
    opponent_role: str = dspy.InputField(
        description="Your role/persona in this negotiation."
    )
    opponent_goal: str = dspy.InputField(
        description="What you want to achieve."
    )
    opponent_constraints: str = dspy.InputField(
        description="Your limitations and constraints."
    )
    conversation_history: str = dspy.InputField(
        description="Full negotiation transcript so far."
    )
    user_last_message: str = dspy.InputField(
        description="The user's most recent message."
    )

    response: str = dspy.OutputField(
        description="Your reply as the opponent. Stay in character. 1-3 sentences typically."
    )
    internal_position: Dict = dspy.OutputField(
        description="""
        Your current internal state (not shared with user):
        - 'satisfaction': 0-10, how satisfied you are with progress
        - 'willingness_to_concede': 'high', 'medium', 'low'
        - 'concessions_made': List of things you've already given up
        - 'key_demands': What you still want
        """
    )


class MessageAnalyzer(dspy.Signature):
    """
    You are a negotiation coach analyzing a single message from a trainee.
    Identify what negotiation tactics, techniques, and communication
    approaches were used.
    """

    message: str = dspy.InputField(
        description="The user's last message to the opponent."
    )
    scenario_context: str = dspy.InputField(
        description="Brief scenario context."
    )

    tactics_used: List[str] = dspy.OutputField(
        description="""
        List of detected tactics, e.g.:
        - 'anchoring', 'reciprocity', 'framing', 'active_listening',
        - 'emotion_appeal', 'deadline_pressure', 'objective_criteria',
        - 'collaborative', 'competitive', 'compromise'
        """
    )
    effectiveness_rating: int = dspy.OutputField(
        description="Rate the message effectiveness from 1-10."
    )
    feedback_snippet: str = dspy.OutputField(
        description="One sentence of immediate feedback."
    )


class FeedbackEvaluator(dspy.Signature):
    """
    You are an expert negotiation coach. You've observed an entire
    negotiation practice session between a trainee and a simulated
    counterparty. Provide comprehensive feedback and a performance
    assessment.
    """

    scenario_context: str = dspy.InputField(
        description="Full scenario with roles and goals."
    )
    full_conversation: str = dspy.InputField(
        description="Complete negotiation transcript."
    )
    final_outcome: str = dspy.InputField(
        description="How the negotiation ended (agreement, impasse, etc.)"
    )

    overall_score: int = dspy.OutputField(
        description="Overall performance score from 0-100."
    )
    scores_by_category: Dict = dspy.OutputField(
        description="""
        Scores (0-10) for each dimension:
        - 'preparation': Did they understand their role and goals?
        - 'communication': Were they clear, respectful, professional?
        - 'strategy': Did they use effective negotiation tactics?
        - 'listening': Did they respond to the opponent's points?
        - 'problem_solving': Did they seek creative solutions?
        - 'flexibility': Were they appropriately flexible?
        """
    )
    strengths: List[str] = dspy.OutputField(
        description="3-5 things they did well."
    )
    areas_for_improvement: List[str] = dspy.OutputField(
        description="3-5 areas to improve."
    )
    key_takeaways: List[str] = dspy.OutputField(
        description="3 memorable lessons from this session."
    )
    suggested_resources: List[str] = dspy.OutputField(
        description="2-3 book/article/video suggestions."
    )


class NegotiationService:
    """Stateless business layer orchestrating the DSPy negotiation components."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, stop=None, cache=False)

    @staticmethod
    def _build_scenario(raw: object) -> NegotiationScenario:
        """
        Normalizes raw DSPy output into a validated NegotiationScenario model.

        Args:
            raw (object): Raw scenario dictionary from the LLM.

        Returns:
            NegotiationScenario: The validated scenario model.
        """
        data = raw if isinstance(raw, dict) else {}
        key_issues = data.get("key_issues", [])
        if isinstance(key_issues, list):
            key_issues = [str(item) for item in key_issues]
        else:
            key_issues = [str(key_issues)]
        return NegotiationScenario(
            title=str(data.get("title", "")),
            context=str(data.get("context", "")),
            your_role=str(data.get("your_role", "")),
            your_goal=str(data.get("your_goal", "")),
            your_constraints=str(data.get("your_constraints", "")),
            opponent_role=str(data.get("opponent_role", "")),
            opponent_goal=str(data.get("opponent_goal", "")),
            opponent_constraints=str(data.get("opponent_constraints", "")),
            key_issues=key_issues,
            starting_stance_opponent=str(data.get("starting_stance_opponent", "")),
        )

    @staticmethod
    def _build_internal_position(raw: object) -> InternalPosition:
        """
        Normalizes raw DSPy output into a validated InternalPosition model.

        Args:
            raw (object): Raw internal-position dictionary from the LLM.

        Returns:
            InternalPosition: The validated internal-position model.
        """
        data = raw if isinstance(raw, dict) else {}
        satisfaction = data.get("satisfaction", 5)
        try:
            satisfaction = int(satisfaction)
        except (TypeError, ValueError):
            satisfaction = 5
        satisfaction = max(0, min(10, satisfaction))

        willingness = str(data.get("willingness_to_concede", "medium")).lower()
        if willingness not in ("high", "medium", "low"):
            willingness = "medium"

        concessions = data.get("concessions_made", [])
        if not isinstance(concessions, list):
            concessions = [str(concessions)] if concessions else []

        demands = data.get("key_demands", [])
        if not isinstance(demands, list):
            demands = [str(demands)] if demands else []

        return InternalPosition(
            satisfaction=satisfaction,
            willingness_to_concede=willingness,
            concessions_made=[str(item) for item in concessions],
            key_demands=[str(item) for item in demands],
        )

    @staticmethod
    def _build_category_scores(raw: object) -> CategoryScores:
        """
        Normalizes raw DSPy output into a validated CategoryScores model.

        Args:
            raw (object): Raw scores-by-category dictionary from the LLM.

        Returns:
            CategoryScores: The validated category-scores model.
        """
        data = raw if isinstance(raw, dict) else {}

        def _score(key: str) -> int:
            value = data.get(key, 5)
            try:
                value = int(value)
            except (TypeError, ValueError):
                value = 5
            return max(0, min(10, value))

        return CategoryScores(
            preparation=_score("preparation"),
            communication=_score("communication"),
            strategy=_score("strategy"),
            listening=_score("listening"),
            problem_solving=_score("problem_solving"),
            flexibility=_score("flexibility"),
        )

    @staticmethod
    def _format_history(messages: List[ChatMessage]) -> str:
        """
        Serializes conversation history into a readable transcript string.

        Args:
            messages (List[ChatMessage]): The transcript messages.

        Returns:
            str: Formatted transcript.
        """
        return "\n".join(f"[{m.role}]: {m.message}" for m in messages)

    async def generate_scenario(self, data: ScenarioRequest) -> ScenarioResponse:
        """
        Generates a negotiation scenario and the opponent's opening message.

        The scenario is persisted by the client's session/memory app and passed
        back with every subsequent request.

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
                domain=data.domain,
            )
            scenario = self._build_scenario(result.scenario)
            logger.info("Generated %s negotiation scenario in domain '%s'", data.difficulty, data.domain)
            return ScenarioResponse(
                scenario=scenario,
                opening_message=scenario.starting_stance_opponent,
            )
        except Exception as exc:
            logger.error("Scenario generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def get_opponent_turn(self, data: OpponentTurnRequest) -> OpponentTurnResponse:
        """
        Generates the opponent's reply and internal state for the user's message.

        Args:
            data (OpponentTurnRequest): The validated turn request.

        Returns:
            OpponentTurnResponse: The opponent's reply and internal state.

        Raises:
            GenerationError: If the opponent pipeline fails.
        """
        try:
            result = run_predictor(
                OpponentResponse,
                self.lm,
                scenario_context=data.scenario.model_dump_json(),
                opponent_role=data.scenario.opponent_role,
                opponent_goal=data.scenario.opponent_goal,
                opponent_constraints=data.scenario.opponent_constraints,
                conversation_history=self._format_history(data.conversation_history),
                user_last_message=data.user_last_message,
            )
            logger.info("Opponent turn generated for scenario '%s'", data.scenario.title)
            return OpponentTurnResponse(
                response=result.response,
                internal_position=self._build_internal_position(result.internal_position),
            )
        except Exception as exc:
            logger.error("Opponent turn failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def analyze_message(self, data: AnalyzeMessageRequest) -> AnalyzeMessageResponse:
        """
        Analyzes a single trainee message for negotiation tactics.

        Args:
            data (AnalyzeMessageRequest): The validated analysis request.

        Returns:
            AnalyzeMessageResponse: The detected tactics and feedback.

        Raises:
            GenerationError: If the analysis pipeline fails.
        """
        try:
            result = run_predictor(
                MessageAnalyzer,
                self.lm,
                message=data.message,
                scenario_context=data.scenario_context,
            )
            logger.info("Analyzed trainee message (rating=%s)", result.effectiveness_rating)
            return AnalyzeMessageResponse(
                tactics_used=result.tactics_used,
                effectiveness_rating=result.effectiveness_rating,
                feedback_snippet=result.feedback_snippet,
            )
        except Exception as exc:
            logger.error("Message analysis failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def run_turn(self, data: NegotiationTurnRequest) -> NegotiationTurnResponse:
        """
        Runs a combined turn: opponent reply, internal state, and optional
        message-tactic analysis in a single call.

        Args:
            data (NegotiationTurnRequest): The validated combined turn request.

        Returns:
            NegotiationTurnResponse: The opponent's reply, internal state, and optional analysis.

        Raises:
            GenerationError: If any pipeline step fails.
        """
        try:
            opponent_result = run_predictor(
                OpponentResponse,
                self.lm,
                scenario_context=data.scenario.model_dump_json(),
                opponent_role=data.scenario.opponent_role,
                opponent_goal=data.scenario.opponent_goal,
                opponent_constraints=data.scenario.opponent_constraints,
                conversation_history=self._format_history(data.conversation_history),
                user_last_message=data.user_last_message,
            )
            analysis = None
            if data.analyze_message:
                analysis_result = run_predictor(
                    MessageAnalyzer,
                    self.lm,
                    message=data.user_last_message,
                    scenario_context=data.scenario.model_dump_json(),
                )
                analysis = MessageAnalysis(
                    tactics_used=analysis_result.tactics_used,
                    effectiveness_rating=analysis_result.effectiveness_rating,
                    feedback_snippet=analysis_result.feedback_snippet,
                )
            logger.info(
                "Turn executed for scenario '%s' (analyze=%s)",
                data.scenario.title,
                data.analyze_message,
            )
            return NegotiationTurnResponse(
                opponent_reply=opponent_result.response,
                internal_position=self._build_internal_position(opponent_result.internal_position),
                analysis=analysis,
            )
        except Exception as exc:
            logger.error("Combined turn failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def evaluate_session(self, data: EvaluateSessionRequest) -> EvaluateSessionResponse:
        """
        Evaluates a completed negotiation session and provides feedback.

        Args:
            data (EvaluateSessionRequest): The validated evaluation request.

        Returns:
            EvaluateSessionResponse: The overall score, category scores, and feedback.

        Raises:
            GenerationError: If the evaluation pipeline fails.
        """
        try:
            result = run_predictor(
                FeedbackEvaluator,
                self.lm,
                scenario_context=data.scenario.model_dump_json(),
                full_conversation=self._format_history(data.conversation_history),
                final_outcome=data.final_outcome,
            )
            logger.info("Evaluated session for scenario '%s'", data.scenario.title)
            try:
                overall_score = int(result.overall_score)
            except (TypeError, ValueError):
                overall_score = 50
            overall_score = max(0, min(100, overall_score))
            return EvaluateSessionResponse(
                overall_score=overall_score,
                scores_by_category=self._build_category_scores(result.scores_by_category),
                strengths=result.strengths,
                areas_for_improvement=result.areas_for_improvement,
                key_takeaways=result.key_takeaways,
                suggested_resources=result.suggested_resources,
            )
        except Exception as exc:
            logger.error("Session evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
