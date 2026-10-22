import logging
from typing import Any, Dict, List

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.battleground.schemas import (
    BattleChallengeRequest,
    BattleChallengeResponse,
    BattleEvaluateRequest,
    BattleEvaluateResponse,
    BattleStartRequest,
    BattleStartResponse,
)

logger = logging.getLogger(__name__)


class BattlegroundError(Exception):
    """Base exception for all battleground module failures."""


class GenerationError(BattlegroundError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class UserProfileGenerator(dspy.Signature):
    """
    You are a military intelligence analyst. Process the user's provided details
    into a structured combat profile. Assess their strengths, weaknesses, and
    determine their starting loadout based on their expertise and the battleground domain.
    """

    user_name: str = dspy.InputField(description="User's callsign or preferred name.")
    user_expertise: str = dspy.InputField(description="User's stated area of expertise or skills.")
    user_preferred_style: str = dspy.InputField(description="User's preferred combat/strategy style.")
    user_background: str = dspy.InputField(description="User's background story or experience.")
    battleground_topic: str = dspy.InputField(description="The battleground domain/topic.")

    user_profile: Dict[str, Any] = dspy.OutputField(description="""
        Structured combat profile:
        - 'callsign': Official military-style callsign
        - 'rank': Starting rank/title appropriate to background
        - 'specializations': List of 2-4 skill areas
        - 'strengths': List of 2-3 combat strengths
        - 'weaknesses': List of 1-2 exploitable vulnerabilities
        - 'available_loadout': List of 3-5 starting equipment/abilities
        - 'combat_doctrine': Formalized combat philosophy (1 sentence)
    """)


class OpponentGenerator(dspy.Signature):
    """
    You are a strategic adversary designer. Create a formidable opponent that
    is specifically tailored to challenge the given user profile. The opponent
    should exploit the user's weaknesses while respecting the difficulty level.
    The opponent must feel like a real, adaptive threat — not a generic enemy.
    """

    battleground_topic: str = dspy.InputField(description="The battleground domain/topic.")
    difficulty: str = dspy.InputField(description="Difficulty: easy, medium, or hard.")
    user_profile: Dict[str, Any] = dspy.InputField(
        description="The user's combat profile — opponent must counter their strengths."
    )
    battleground_theme: str = dspy.InputField(
        description="Overall theme/tone of the battleground scenario."
    )

    opponent_profile: Dict[str, Any] = dspy.OutputField(description="""
        Complete adversary profile:
        - 'name': Opponent name/callsign (intimidating and memorable)
        - 'title': Role/rank/designation
        - 'capabilities': Dict mapping capability areas to levels (1-10)
        - 'motives': Strategic objectives (what they want to achieve)
        - 'personality': 2-3 behavioral traits that define their decision-making
        - 'adaptability_style': How they learn and counter the user
        - 'signature_tactics': List of 3 preferred tactical approaches
        - 'weaknesses': 1-2 exploitable vulnerabilities (fewer on hard difficulty)
        - 'available_resources': List of assets/forces at their disposal
    """)
    opponent_strategy: str = dspy.OutputField(
        description="Overall strategic approach this opponent will use against this specific user."
    )
    first_impression: str = dspy.OutputField(
        description="How the opponent perceives the user after initial reconnaissance."
    )


class ScenarioGenerator(dspy.Signature):
    """
    You are a battleground architect. Using the user profile and opponent profile,
    design a compelling battleground scenario with environment, objectives, and
    evaluation criteria. The scenario should create natural tension between the
    user's strengths and the opponent's strategy.
    """

    battleground_topic: str = dspy.InputField(description="Domain/topic of the battleground.")
    difficulty: str = dspy.InputField(description="Difficulty level.")
    user_profile: Dict[str, Any] = dspy.InputField(description="User's structured combat profile.")
    opponent_profile: Dict[str, Any] = dspy.InputField(description="Opponent's structured profile.")
    opponent_strategy: str = dspy.InputField(description="Opponent's strategic approach.")

    scenario_context: str = dspy.OutputField(
        description="Rich narrative background (3-5 sentences) setting the stage."
    )
    battlefield_environment: Dict[str, str] = dspy.OutputField(description="""
        Environment details:
        - 'terrain': Physical/virtual terrain description
        - 'weather_conditions': Environmental factors affecting operations
        - 'time_of_day': Affects visibility and operations
        - 'hazards': Environmental dangers present
        - 'strategic_points': Key locations that provide advantages
    """)
    initial_user_health: int = dspy.OutputField(
        description="Int (50-100). Higher if user has strong profile for the topic."
    )
    initial_opponent_health: int = dspy.OutputField(
        description="Int (60-100). Scales with difficulty: easy=60-70, medium=75-85, hard=90-100."
    )
    evaluation_criteria: Dict[str, str] = dspy.OutputField(description="""
        Metrics for scoring each round. Dict of 3-4 criteria:
        e.g., {'tactical_accuracy': 'How well the response addresses the threat',
               'resource_efficiency': 'Conservation of assets while achieving objectives',
               'adaptability': 'Ability to handle unexpected developments'}
    """)
    mission_objective: str = dspy.OutputField(
        description="The user's overall mission goal — what constitutes victory."
    )
    rules_of_engagement: List[str] = dspy.OutputField(
        description="3-4 constraints/rules that govern the battleground."
    )


class TacticsDecider(dspy.Signature):
    """
    You are the opponent's tactical AI. Decide your next move based on the
    battlefield state, your profile, and what you've learned about the user.
    Think like a real adversary — exploit weaknesses, avoid their strengths,
    and adapt based on previous encounters.
    """

    opponent_profile: Dict[str, Any] = dspy.InputField(description="Your capabilities and traits.")
    battlefield_environment: Dict[str, str] = dspy.InputField(description="Current environment state.")
    user_health: int = dspy.InputField(description="User's current health.")
    opponent_health: int = dspy.InputField(description="Your current health.")
    previous_user_action: str = dspy.InputField(description="What the user did last round.")
    previous_score: float = dspy.InputField(description="How well the user performed (0.0-1.0).")
    round_number: int = dspy.InputField(description="Current round number.")
    opponent_learning_log: str = dspy.InputField(description="Your accumulated observations about the user.")
    user_profile: Dict[str, Any] = dspy.InputField(description="User's known strengths and weaknesses.")

    decision: str = dspy.OutputField(description="""
        Your chosen tactical maneuver this round. One of: full_assault, flanking_manuever,
        ambush, fortify_defense, electronic_warfare, psychological_ops, resource_denial,
        deception, retreat_regroup, counter_intelligence.
    """)
    reasoning: str = dspy.OutputField(
        description="Detailed tactical reasoning for this choice."
    )
    target_weakness: str = dspy.OutputField(
        description="Which specific user weakness this tactic exploits."
    )
    expected_user_response_type: str = dspy.OutputField(
        description="What kind of response you anticipate from the user."
    )
    updated_learning_log: str = dspy.OutputField(
        description="Updated observations about user patterns and tendencies."
    )


class ChallengeGenerator(dspy.Signature):
    """
    You are the battlefield scenario director. Create the next tactical challenge
    that the user must face. Include environmental context, reference intelligence,
    and clear objectives. The challenge should feel like a real military/cyber
    operation with fog of war elements.
    """

    scenario_context: str = dspy.InputField(description="Overall battleground narrative.")
    battlefield_environment: Dict[str, str] = dspy.InputField(description="Current environment state.")
    user_profile: Dict[str, Any] = dspy.InputField(description="User's combat profile.")
    opponent_profile: Dict[str, Any] = dspy.InputField(description="Opponent's profile.")
    tactic_decision: str = dspy.InputField(description="The opponent's chosen tactic.")
    tactic_reasoning: str = dspy.InputField(description="Why the opponent chose this tactic.")
    target_weakness: str = dspy.InputField(description="What weakness is being targeted.")
    current_state_summary: str = dspy.InputField(description="HP and round status.")
    round_number: int = dspy.InputField(description="Current round.")

    mission_briefing: str = dspy.OutputField(
        description="Narrative setup (2-3 sentences) for this encounter."
    )
    tactical_situation: str = dspy.OutputField(
        description="Description of the immediate tactical situation on the ground."
    )
    specific_challenge: str = dspy.OutputField(
        description="What the user must accomplish this round."
    )
    main_question: str = dspy.OutputField(
        description="The primary problem/decision the user must solve."
    )
    constraints: List[str] = dspy.OutputField(
        description="2-3 operational limits (time, resources, rules)."
    )
    reference_material: Dict[str, str] = dspy.OutputField(description="""
        Intelligence artifacts the user must analyze. Dict of {Title: Content}.
        Vary these each round. Examples: satellite_imagery, intercepted_comms,
        terrain_map, enemy_order_of_battle, system_logs, field_report.
    """)
    environment_change: str = dspy.OutputField(
        description="Any change to battlefield conditions this round, or 'No significant changes.'"
    )


class ResponseEvaluator(dspy.Signature):
    """
    You are the battlefield adjudicator. Evaluate the user's tactical response
    against the challenge, considering the environment, opponent's tactic, and
    the user's capabilities. Be fair but realistic — reward clever thinking,
    punish carelessness. Determine health changes and narrative consequences.
    """

    scenario_context: str = dspy.InputField(description="Overall battleground narrative.")
    battlefield_environment: Dict[str, str] = dspy.InputField(description="Current environment.")
    evaluation_criteria: Dict[str, str] = dspy.InputField(description="Scoring metrics.")
    current_challenge: str = dspy.InputField(description="What the user was asked to do.")
    main_question: str = dspy.InputField(description="The primary problem posed.")
    reference_material: Dict[str, str] = dspy.InputField(description="Intel provided to user.")
    user_response: str = dspy.InputField(description="The user's actual response/action.")
    user_health: int = dspy.InputField(description="User's current HP.")
    opponent_health: int = dspy.InputField(description="Opponent's current HP.")
    user_profile: Dict[str, Any] = dspy.InputField(description="User's capabilities.")
    opponent_profile: Dict[str, Any] = dspy.InputField(description="Opponent's capabilities.")
    tactic_used: str = dspy.InputField(description="What the opponent attempted.")

    score: float = dspy.OutputField(description="0.0 to 1.0 — overall tactical effectiveness.")
    feedback: str = dspy.OutputField(description="Detailed tactical critique (2-3 sentences).")
    health_impact_user: int = dspy.OutputField(
        description="Change in user health (-50 to +10). Negative = damage taken."
    )
    health_impact_opponent: int = dspy.OutputField(
        description="Change in opponent health (-30 to 0). Negative = damage dealt."
    )
    is_terminated: bool = dspy.OutputField(
        description="Should simulation end? (catastrophic failure or critical success)"
    )
    termination_reason: str = dspy.OutputField(
        description="Why it ended, or empty string if continuing."
    )
    narrative_consequence: str = dspy.OutputField(
        description="Story result of this action (2-3 sentences)."
    )
    battlefield_shift: str = dspy.OutputField(
        description="How the tactical situation changes after this round."
    )
    resource_impact: Dict[str, int] = dspy.OutputField(description="""
        Changes to user's resources. Dict of {resource_name: change_amount}.
        Empty dict {} if no resource changes this round.
    """)


class BattlegroundService:
    """Stateless business layer wrapping the DSPy battleground pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4, cache=False)

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
    def _coerce_list(value: object) -> List[Any]:
        """
        Coerces a raw value into a list of strings.

        Args:
            value (object): The raw LLM output.

        Returns:
            List[Any]: The list value.
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
    def _coerce_float(value: object, default: float = 0.5, high: float = 1.0) -> float:
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
    def _coerce_int(
        value: object,
        default: int = 0,
        low: int = 0,
        high: int = 100,
    ) -> int:
        """
        Coerces a raw value into an integer clamped to [low, high].

        Args:
            value (object): The raw LLM output.
            default (int): Fallback value.
            low (int): Lower bound for clamping.
            high (int): Upper bound for clamping.

        Returns:
            int: A clamped integer.
        """
        try:
            parsed = int(float(value))
        except (TypeError, ValueError):
            return default
        return max(low, min(high, parsed))

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

    async def start_battle(self, data: BattleStartRequest) -> BattleStartResponse:
        """
        Initializes a battleground: builds the user profile, generates the
        opponent, and designs the scenario.

        Args:
            data (BattleStartRequest): The validated start request.

        Returns:
            BattleStartResponse: The full battleground setup to persist.

        Raises:
            GenerationError: If any pipeline step fails.
        """
        try:
            user_result = run_predictor(
                UserProfileGenerator,
                self.lm,
                user_name=data.name,
                user_expertise=data.expertise,
                user_preferred_style=data.preferred_style,
                user_background=data.background,
                battleground_topic=data.topic,
            )
            user_profile = self._as_dict(user_result.user_profile)

            opponent_result = run_predictor(
                OpponentGenerator,
                self.lm,
                battleground_topic=data.topic,
                difficulty=data.difficulty,
                user_profile=user_profile,
                battleground_theme=data.theme or data.topic,
            )
            opponent_profile = self._as_dict(opponent_result.opponent_profile)
            opponent_strategy = self._coerce_str(opponent_result.opponent_strategy)
            first_impression = self._coerce_str(opponent_result.first_impression)

            scenario_result = run_predictor(
                ScenarioGenerator,
                self.lm,
                battleground_topic=data.topic,
                difficulty=data.difficulty,
                user_profile=user_profile,
                opponent_profile=opponent_profile,
                opponent_strategy=opponent_strategy,
            )

            resources: Dict[str, int] = {}
            for item in self._coerce_list(user_profile.get("available_loadout")):
                resources[item] = 1

            logger.info("Initialized battleground on topic '%s'", data.topic)
            return BattleStartResponse(
                user_profile=user_profile,
                opponent_profile=opponent_profile,
                opponent_strategy=opponent_strategy,
                opponent_first_impression=first_impression,
                scenario_context=self._coerce_str(scenario_result.scenario_context),
                battlefield_environment=self._as_dict(scenario_result.battlefield_environment),
                evaluation_criteria=self._as_dict(scenario_result.evaluation_criteria),
                mission_objective=self._coerce_str(scenario_result.mission_objective),
                rules_of_engagement=self._coerce_list(scenario_result.rules_of_engagement),
                initial_user_health=self._coerce_int(
                    scenario_result.initial_user_health, default=100, low=50, high=100
                ),
                initial_opponent_health=self._coerce_int(
                    scenario_result.initial_opponent_health, default=80, low=60, high=100
                ),
                user_resources=resources,
            )
        except Exception as exc:
            logger.error("Battleground init failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def get_challenge(self, data: BattleChallengeRequest) -> BattleChallengeResponse:
        """
        Generates the next tactical challenge: the opponent decides its move
        and the scenario director frames the encounter.

        Args:
            data (BattleChallengeRequest): The validated challenge request.

        Returns:
            BattleChallengeResponse: The challenge and updated learning log.

        Raises:
            GenerationError: If any pipeline step fails.
        """
        try:
            tactics_result = run_predictor(
                TacticsDecider,
                self.lm,
                opponent_profile=data.opponent_profile,
                battlefield_environment=data.battlefield_environment,
                user_health=data.user_health,
                opponent_health=data.opponent_health,
                previous_user_action=data.previous_user_action,
                previous_score=data.previous_score,
                round_number=data.round_number,
                opponent_learning_log=data.opponent_learning_log,
                user_profile=data.user_profile,
            )
            tactic_decision = self._coerce_str(tactics_result.decision)
            updated_log = self._coerce_str(tactics_result.updated_learning_log)

            current_state_summary = (
                f"Round {data.round_number}. "
                f"User HP: {data.user_health} | Opponent HP: {data.opponent_health}"
            )

            challenge_result = run_predictor(
                ChallengeGenerator,
                self.lm,
                scenario_context=data.scenario_context,
                battlefield_environment=data.battlefield_environment,
                user_profile=data.user_profile,
                opponent_profile=data.opponent_profile,
                tactic_decision=tactic_decision,
                tactic_reasoning=self._coerce_str(tactics_result.reasoning),
                target_weakness=self._coerce_str(tactics_result.target_weakness),
                current_state_summary=current_state_summary,
                round_number=data.round_number,
            )

            logger.info("Generated challenge for round %d", data.round_number)
            return BattleChallengeResponse(
                tactic_type=tactic_decision,
                briefing=self._coerce_str(challenge_result.mission_briefing),
                tactical_situation=self._coerce_str(challenge_result.tactical_situation),
                challenge=self._coerce_str(challenge_result.specific_challenge),
                question=self._coerce_str(challenge_result.main_question),
                constraints=self._coerce_list(challenge_result.constraints),
                reference_material=self._as_dict(challenge_result.reference_material),
                updated_learning_log=updated_log,
                environment_change=self._coerce_str(challenge_result.environment_change),
            )
        except Exception as exc:
            logger.error("Battleground challenge failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def evaluate_response(self, data: BattleEvaluateRequest) -> BattleEvaluateResponse:
        """
        Adjudicates the user's tactical response: scores it, applies health and
        resource changes, and reports termination conditions.

        Args:
            data (BattleEvaluateRequest): The validated evaluate request.

        Returns:
            BattleEvaluateResponse: The adjudication result and deltas.

        Raises:
            GenerationError: If the evaluation pipeline fails.
        """
        try:
            result = run_predictor(
                ResponseEvaluator,
                self.lm,
                scenario_context=data.scenario_context,
                battlefield_environment=data.battlefield_environment,
                evaluation_criteria=data.evaluation_criteria,
                current_challenge=data.current_challenge,
                main_question=data.main_question,
                reference_material=data.reference_material,
                user_response=data.user_response,
                user_health=data.user_health,
                opponent_health=data.opponent_health,
                user_profile=data.user_profile,
                opponent_profile=data.opponent_profile,
                tactic_used=data.tactic_used,
            )

            logger.info("Evaluated round response for '%s'", data.tactic_used)
            return BattleEvaluateResponse(
                score=self._coerce_float(result.score, default=0.5, high=1.0),
                feedback=self._coerce_str(result.feedback),
                narrative=self._coerce_str(result.narrative_consequence),
                battlefield_shift=self._coerce_str(result.battlefield_shift),
                hp_delta_user=self._coerce_int(
                    result.health_impact_user, default=0, low=-50, high=10
                ),
                hp_delta_opponent=self._coerce_int(
                    result.health_impact_opponent, default=0, low=-30, high=0
                ),
                resource_impact=self._as_dict(result.resource_impact),
                is_terminated=self._coerce_bool(result.is_terminated),
                termination_reason=self._coerce_str(result.termination_reason),
            )
        except Exception as exc:
            logger.error("Battleground evaluation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
