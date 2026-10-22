import logging
from typing import Any, Dict, List, Literal, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from practice.foresight_trainer.schemas import (
    ChoiceOption,
    Consequences,
    DecisionEvaluation,
    DecisionRecord,
    DecisionRequest,
    DecisionResponse,
    InsightReport,
    ProgressReport,
    ScenarioBlueprint,
    Scene,
    StartRequest,
    StartResponse,
)

logger = logging.getLogger(__name__)

RISK_VALUES: tuple = ("low", "medium", "high")
TIME_VALUES: tuple = ("fast", "moderate", "slow")
SKILL_VALUES: tuple = ("developing", "competent", "proficient", "expert")
SCORE_KEYS: tuple = ("foresight", "empathy", "creativity", "risk_awareness", "reasoning_quality")


class ForesightError(Exception):
    """Base exception for all foresight trainer failures."""


class GenerationError(ForesightError):
    """Raised when a DSPy pipeline fails to produce content."""


class ContextAnalyzer(dspy.Signature):
    """
    You are a Narrative Architect. The user gives you a rough context
    and a main theme. Your job is to extract and enrich this into a
    structured scenario blueprint that other modules will use.

    Think about:
    - What world/setting does this take place in?
    - Who is the protagonist and what are their constraints?
    - What are the core stakes and tensions?
    - What real-world thinking skill does this theme train?
    """

    user_context: str = dspy.InputField(
        description="Raw background context or scenario description from the user."
    )
    main_theme: str = dspy.InputField(
        description="The core theme or skill to train (e.g., 'strategic negotiation', 'crisis management', 'ethical dilemmas')."
    )
    difficulty_level: Literal["beginner", "intermediate", "advanced"] = dspy.InputField(
        description="Desired difficulty level for the scenario."
    )

    scenario_blueprint: Dict[str, Any] = dspy.OutputField(
        description="""
        Structured blueprint containing:
        - 'setting': Where and when this takes place
        - 'protagonist': Who the user is in this scenario (role, constraints, resources)
        - 'core_conflict': The central tension or problem
        - 'stakes': What happens if they succeed or fail
        - 'thinking_skill': The specific cognitive skill being trained
        - 'tone': The narrative tone (tense, reflective, fast-paced, etc.)
        - 'hidden_variables': 2-3 underlying factors the user doesn't know about yet
        """
    )


class SituationGenerator(dspy.Signature):
    """
    You are an Immersive Storyteller. Given a scenario blueprint,
    you craft a vivid, engaging opening scene that drops the user
    directly into the action. The scene should feel real, urgent,
    and thought-provoking.

    Rules:
    - Write in second person ("You are...")
    - Show, don't tell — use sensory details and specific numbers
    - End the scene at a critical decision point
    - The situation should have no obviously "perfect" answer
    """

    scenario_blueprint: Dict[str, Any] = dspy.InputField(
        description="The structured blueprint from ContextAnalyzer."
    )
    scene_number: int = dspy.InputField(
        description="Which scene this is (1 for opening scene)."
    )
    previous_context: Optional[str] = dspy.InputField(
        default=None,
        description="Summary of what happened before (None for scene 1).",
    )

    scene_narrative: str = dspy.OutputField(
        description="The immersive scene description in second person, 150-300 words."
    )
    decision_point: str = dspy.OutputField(
        description="A clear statement of the decision the user must make right now."
    )
    time_pressure: str = dspy.OutputField(
        description="Description of any time constraint or urgency (e.g., 'You have 2 hours before the board meeting')."
    )


class OptionDesigner(dspy.Signature):
    """
    You are a Strategic Choice Architect. Given a decision point,
    you design 3-4 distinct options the user can choose from.

    Each option should represent a genuinely different APPROACH
    (not just variations of the same thing). Tag each option with
    the thinking style it represents so the evaluator can track patterns.

    Rules:
    - No option should be obviously wrong or a joke
    - At least one option should be creative/unconventional
    - Options should trade off different values (speed vs thoroughness,
      risk vs safety, short-term vs long-term, etc.)
    """

    decision_point: str = dspy.InputField(
        description="The specific decision the user must make."
    )
    scene_narrative: str = dspy.InputField(
        description="The full scene context for reference."
    )
    scenario_blueprint: Dict[str, Any] = dspy.InputField(
        description="The blueprint for hidden variables and stakes context."
    )

    options: List[Dict[str, Any]] = dspy.OutputField(
        description="""
        A list of 3-4 options. Each contains:
        - 'id': Option letter (A, B, C, D)
        - 'title': Short 3-5 word label for the option
        - 'description': What this action involves (2-3 sentences)
        - 'approach_type': The thinking style (e.g., 'analytical', 'diplomatic',
          'aggressive', 'creative', 'cautious', 'collaborative', 'delegative')
        - 'risk_level': 'low', 'medium', or 'high'
        - 'time_cost': 'fast', 'moderate', or 'slow'
        - 'hidden_tradeoff': What this option sacrifices (shown only after choice)
        """
    )
    custom_option_prompt: str = dspy.OutputField(
        description="A prompt encouraging the user to also write their own custom option if none fit."
    )


class DecisionEvaluator(dspy.Signature):
    """
    You are a Decision Science Analyst. The user has made a choice
    and provided their reasoning. You evaluate BOTH the choice AND
    the quality of their thinking process.

    Remember: A good outcome from a bad process is still luck, not skill.
    A bad outcome from a good process is still a good decision.
    Evaluate the THINKING, not just the result.

    Scoring dimensions:
    - Foresight: Did they consider future consequences?
    - Empathy: Did they consider other stakeholders?
    - Creativity: Did they think beyond obvious options?
    - Risk Awareness: Did they understand what could go wrong?
    - Reasoning Quality: Is their logic sound and well-structured?
    """

    user_choice: str = dspy.InputField(
        description="The option the user selected (A/B/C/D or custom)."
    )
    user_reasoning: str = dspy.InputField(
        description="The user's explanation of WHY they made this choice."
    )
    options: List[Dict[str, Any]] = dspy.InputField(
        description="The available options they chose from."
    )
    scenario_blueprint: Dict[str, Any] = dspy.InputField(
        description="The blueprint with stakes and hidden variables."
    )

    evaluation: Dict[str, Any] = dspy.OutputField(
        description="""
        Structured evaluation containing:
        - 'scores': Dict with each dimension scored 1-10:
            'foresight', 'empathy', 'creativity', 'risk_awareness', 'reasoning_quality'
        - 'overall_score': Weighted average (float, 1-10)
        - 'strengths': List of 2-3 things they did well in their thinking
        - 'blind_spots': List of 2-3 things they missed or didn't consider
        - 'thinking_pattern': What style of thinker they're showing as
          (e.g., 'cautious optimizer', 'bold innovator', 'consensus builder')
        - 'one_lesson': A single powerful insight about their decision-making
        """
    )


class ConsequenceEngine(dspy.Signature):
    """
    You are a Causal Reasoning Engine. Given the user's choice and
    the scenario context, you determine realistic consequences.

    Rules:
    - Consequences should be realistic, not cartoonish
    - Include both immediate and delayed effects
    - Reveal some of the 'hidden_variables' from the blueprint
    - Create new complications — the story should evolve, not resolve
    - Some consequences should be unexpected but logical in hindsight
    """

    user_choice: str = dspy.InputField(
        description="What the user decided to do."
    )
    user_reasoning: str = dspy.InputField(
        description="The user's stated reasoning."
    )
    scenario_blueprint: Dict[str, Any] = dspy.InputField(
        description="Full blueprint including hidden variables."
    )
    scene_narrative: str = dspy.InputField(
        description="The scene where the decision was made."
    )
    evaluation: Dict[str, Any] = dspy.InputField(
        description="The evaluation scores and insights."
    )

    consequences: Dict[str, Any] = dspy.OutputField(
        description="""
        Structured consequences containing:
        - 'immediate_effects': List of 2-3 things that happen right away
        - 'delayed_effects': List of 1-2 things that emerge later
        - 'hidden_reveal': Which hidden variable(s) get revealed and how
        - 'new_complication': A new problem or twist that arises
        - 'relationship_impact': How key characters/stakeholders are affected
        - 'resource_changes': What resources were gained or lost
        - 'world_state_update': Brief summary of how the world has changed
        """
    )


class NextSceneGenerator(dspy.Signature):
    """
    You are a Narrative Director. Given the consequences of the
    user's previous decision, you craft the next scene that
    continues the story naturally.

    The new scene should:
    - Feel like a natural continuation, not a reset
    - Introduce the new complication from the consequence engine
    - Raise the stakes or deepen the complexity
    - Present a genuinely new type of challenge
    - Keep the user engaged and thinking
    """

    consequences: Dict[str, Any] = dspy.InputField(
        description="The consequences from the previous decision."
    )
    scenario_blueprint: Dict[str, Any] = dspy.InputField(
        description="The original blueprint for consistency."
    )
    scene_number: int = dspy.InputField(
        description="The scene number we're generating now."
    )
    previous_scene_summary: str = dspy.InputField(
        description="Brief summary of the previous scene and outcome."
    )
    evaluation: Dict[str, Any] = dspy.InputField(
        description="Previous evaluation to calibrate difficulty."
    )

    scene_narrative: str = dspy.OutputField(
        description="The next immersive scene in second person, 150-300 words."
    )
    decision_point: str = dspy.OutputField(
        description="The new critical decision the user faces."
    )
    time_pressure: str = dspy.OutputField(
        description="Updated time constraint or urgency description."
    )
    difficulty_adjustment: str = dspy.OutputField(
        description="How and why the difficulty changed from the last scene."
    )


class InsightGenerator(dspy.Signature):
    """
    You are a Cognitive Coach. After each round, you provide the user
    with a meta-level insight about their thinking pattern.

    Your goal is NOT to tell them what to do, but to help them
    understand HOW they think and what cognitive biases or strengths
    they're showing.

    Be specific, be kind, be honest. Use one concrete example from
    their reasoning to illustrate your point.
    """

    evaluation: Dict[str, Any] = dspy.InputField(
        description="The decision evaluation with scores and analysis."
    )
    user_reasoning: str = dspy.InputField(
        description="The user's original reasoning for reference."
    )
    scene_number: int = dspy.InputField(
        description="Which scene this insight is for."
    )
    decision_history: Optional[List[Dict[str, Any]]] = dspy.InputField(
        default=None,
        description="Previous decisions and evaluations (if available) to spot patterns.",
    )

    insight_report: Dict[str, Any] = dspy.OutputField(
        description="""
        A coaching report containing:
        - 'pattern_observation': What thinking pattern you're noticing
          (e.g., "You tend to optimize for safety over opportunity")
        - 'cognitive_bias_alert': Any bias detected (e.g., 'loss aversion',
          'anchoring', 'availability heuristic') or 'none_detected'
        - 'strength_spotlight': One specific thing they did brilliantly
        - 'growth_edge': One specific area to stretch into next time
        - 'real_world_parallel': A real-world situation where this same
          thinking pattern matters
        - 'coaching_question': A powerful question to sit with before
          the next scene (e.g., "What would you do if failure wasn't an option?")
        """
    )


class ProgressTracker(dspy.Signature):
    """
    You are a Performance Analyst. Given the full history of a user's
    decisions across multiple scenes, you produce a comprehensive
    progress report showing their growth, patterns, and areas for development.

    This is shown at the end of a scenario or at key milestones.
    """

    decision_history: List[Dict[str, Any]] = dspy.InputField(
        description="""
        Full history of all decisions. Each entry contains:
        - 'scene_number': int
        - 'choice_made': str
        - 'approach_type': str
        - 'scores': Dict of dimension scores
        - 'thinking_pattern': str
        - 'key_blind_spot': str
        """
    )
    main_theme: str = dspy.InputField(
        description="The original theme/skill being trained."
    )

    progress_report: Dict[str, Any] = dspy.OutputField(
        description="""
        A comprehensive report containing:
        - 'overall_growth': How their thinking has evolved (narrative, 3-4 sentences)
        - 'score_trajectory': Dict showing how each dimension changed over time
        - 'dominant_pattern': Their most common thinking style
        - 'underused_strengths': Thinking styles they rarely use but should
        - 'critical_blind_spot': The #1 thing holding them back
        - 'best_moment': The scene where they showed the best thinking
        - 'skill_assessment': Rating of their mastery of the main theme
          ('developing', 'competent', 'proficient', 'expert')
        - 'recommended_focus': What to work on in the next scenario
        - 'archetype': A thinker archetype name (e.g., 'The Strategic Diplomat',
          'The Bold Analyst', 'The Cautious Visionary')
        """
    )


class ForesightService:
    """Stateless business layer orchestrating the DSPy foresight training pipelines."""

    def __init__(self) -> None:
        self.lm_creative = build_lm(temperature=0.8, stop=None, cache=False)
        self.lm_analytical = build_lm(temperature=0.3, stop=None, cache=False)

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
        Coerces a raw value into a list.

        Args:
            value (object): The raw LLM output.

        Returns:
            List[Any]: The list value.
        """
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return [value]

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
    def _coerce_int(value: object, default: int = 5) -> int:
        """
        Coerces a raw value into an integer clamped to [0, 10].

        Args:
            value (object): The raw LLM output.
            default (int): Fallback value.

        Returns:
            int: A clamped integer.
        """
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return default
        return max(0, min(10, parsed))

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
    def _normalize_scores(cls, raw: object) -> Dict[str, int]:
        """
        Normalizes dimension scores from raw LLM output.

        Args:
            raw (object): The raw scores dictionary.

        Returns:
            Dict[str, int]: Normalized scores for each dimension.
        """
        data = cls._as_dict(raw)
        scores: Dict[str, int] = {}
        for key in SCORE_KEYS:
            scores[key] = cls._coerce_int(data.get(key), default=5)
        return scores

    @classmethod
    def _build_blueprint(cls, raw: object) -> ScenarioBlueprint:
        """
        Normalizes raw blueprint output into a ScenarioBlueprint model.

        Args:
            raw (object): The raw blueprint dictionary.

        Returns:
            ScenarioBlueprint: The validated blueprint model.
        """
        data = cls._as_dict(raw)
        return ScenarioBlueprint(
            setting=cls._coerce_str(data.get("setting")),
            protagonist=cls._coerce_str(data.get("protagonist")),
            core_conflict=cls._coerce_str(data.get("core_conflict")),
            stakes=cls._coerce_str(data.get("stakes")),
            thinking_skill=cls._coerce_str(data.get("thinking_skill")),
            tone=cls._coerce_str(data.get("tone")),
            hidden_variables=[cls._coerce_str(item) for item in cls._coerce_list(data.get("hidden_variables"))],
        )

    @classmethod
    def _build_scene(cls, raw: object, include_adjustment: bool = False) -> Scene:
        """
        Normalizes raw scene output into a Scene model.

        Args:
            raw (object): The raw scene fields (dict or prediction).
            include_adjustment (bool): Whether to include the difficulty adjustment.

        Returns:
            Scene: The validated scene model.
        """
        data = raw if isinstance(raw, dict) else {}
        adjustment = cls._coerce_str(data.get("difficulty_adjustment")) if include_adjustment else None
        return Scene(
            scene_narrative=cls._coerce_str(data.get("scene_narrative")),
            decision_point=cls._coerce_str(data.get("decision_point")),
            time_pressure=cls._coerce_str(data.get("time_pressure")),
            difficulty_adjustment=adjustment or None,
        )

    @classmethod
    def _build_options(cls, raw_items: object) -> List[ChoiceOption]:
        """
        Normalizes raw options output into ChoiceOption models.

        Args:
            raw_items (object): The raw options list.

        Returns:
            List[ChoiceOption]: Validated choice options.
        """
        options: List[ChoiceOption] = []
        for item in cls._coerce_list(raw_items):
            data = cls._as_dict(item)
            options.append(
                ChoiceOption(
                    id=cls._coerce_str(data.get("id")),
                    title=cls._coerce_str(data.get("title")),
                    description=cls._coerce_str(data.get("description")),
                    approach_type=cls._coerce_str(data.get("approach_type")),
                    risk_level=cls._pick(data.get("risk_level"), RISK_VALUES, "medium"),
                    time_cost=cls._pick(data.get("time_cost"), TIME_VALUES, "moderate"),
                    hidden_tradeoff=cls._coerce_str(data.get("hidden_tradeoff")),
                )
            )
        return options

    @classmethod
    def _build_evaluation(cls, raw: object) -> DecisionEvaluation:
        """
        Normalizes raw evaluation output into a DecisionEvaluation model.

        Args:
            raw (object): The raw evaluation dictionary.

        Returns:
            DecisionEvaluation: The validated evaluation model.
        """
        data = cls._as_dict(raw)
        return DecisionEvaluation(
            scores=cls._normalize_scores(data.get("scores")),
            overall_score=cls._coerce_float(data.get("overall_score"), default=5.0),
            strengths=[cls._coerce_str(item) for item in cls._coerce_list(data.get("strengths"))],
            blind_spots=[cls._coerce_str(item) for item in cls._coerce_list(data.get("blind_spots"))],
            thinking_pattern=cls._coerce_str(data.get("thinking_pattern")),
            one_lesson=cls._coerce_str(data.get("one_lesson")),
        )

    @classmethod
    def _build_consequences(cls, raw: object) -> Consequences:
        """
        Normalizes raw consequences output into a Consequences model.

        Args:
            raw (object): The raw consequences dictionary.

        Returns:
            Consequences: The validated consequences model.
        """
        data = cls._as_dict(raw)
        return Consequences(
            immediate_effects=[cls._coerce_str(item) for item in cls._coerce_list(data.get("immediate_effects"))],
            delayed_effects=[cls._coerce_str(item) for item in cls._coerce_list(data.get("delayed_effects"))],
            hidden_reveal=cls._coerce_str(data.get("hidden_reveal")),
            new_complication=cls._coerce_str(data.get("new_complication")),
            relationship_impact=cls._coerce_str(data.get("relationship_impact")),
            resource_changes=cls._coerce_str(data.get("resource_changes")),
            world_state_update=cls._coerce_str(data.get("world_state_update")),
        )

    @classmethod
    def _build_insight(cls, raw: object) -> InsightReport:
        """
        Normalizes raw insight output into an InsightReport model.

        Args:
            raw (object): The raw insight dictionary.

        Returns:
            InsightReport: The validated insight model.
        """
        data = cls._as_dict(raw)
        return InsightReport(
            pattern_observation=cls._coerce_str(data.get("pattern_observation")),
            cognitive_bias_alert=cls._coerce_str(data.get("cognitive_bias_alert")),
            strength_spotlight=cls._coerce_str(data.get("strength_spotlight")),
            growth_edge=cls._coerce_str(data.get("growth_edge")),
            real_world_parallel=cls._coerce_str(data.get("real_world_parallel")),
            coaching_question=cls._coerce_str(data.get("coaching_question")),
        )

    @classmethod
    def _build_progress(cls, raw: object) -> ProgressReport:
        """
        Normalizes raw progress output into a ProgressReport model.

        Args:
            raw (object): The raw progress report dictionary.

        Returns:
            ProgressReport: The validated progress model.
        """
        data = cls._as_dict(raw)
        return ProgressReport(
            overall_growth=cls._coerce_str(data.get("overall_growth")),
            score_trajectory=cls._as_dict(data.get("score_trajectory")),
            dominant_pattern=cls._coerce_str(data.get("dominant_pattern")),
            underused_strengths=[cls._coerce_str(item) for item in cls._coerce_list(data.get("underused_strengths"))],
            critical_blind_spot=cls._coerce_str(data.get("critical_blind_spot")),
            best_moment=cls._coerce_str(data.get("best_moment")),
            skill_assessment=cls._pick(data.get("skill_assessment"), SKILL_VALUES, "developing"),
            recommended_focus=cls._coerce_str(data.get("recommended_focus")),
            archetype=cls._coerce_str(data.get("archetype")),
        )

    @staticmethod
    def _build_decision_record(
        scene_number: int,
        choice: str,
        evaluation: DecisionEvaluation,
    ) -> DecisionRecord:
        """
        Builds a DecisionRecord from an evaluation.

        Args:
            scene_number (int): The current scene number.
            choice (str): The user's choice.
            evaluation (DecisionEvaluation): The evaluation model.

        Returns:
            DecisionRecord: The recorded decision.
        """
        blind_spot = evaluation.blind_spots[0] if evaluation.blind_spots else "Unknown"
        return DecisionRecord(
            scene_number=scene_number,
            choice_made=choice,
            approach_type=evaluation.thinking_pattern,
            scores=evaluation.scores,
            thinking_pattern=evaluation.thinking_pattern,
            key_blind_spot=blind_spot,
        )

    async def start_scenario(self, data: StartRequest) -> StartResponse:
        """
        Starts a new scenario: analyzes context into a blueprint, generates
        the opening scene, and designs the first set of options.

        Args:
            data (StartRequest): The validated start request.

        Returns:
            StartResponse: The opening scene, options, and blueprint to persist.

        Raises:
            GenerationError: If any pipeline step fails.
        """
        try:
            blueprint_result = run_predictor(
                ContextAnalyzer,
                self.lm_analytical,
                user_context=data.user_context,
                main_theme=data.main_theme,
                difficulty_level=data.difficulty,
            )
            blueprint = self._build_blueprint(blueprint_result.scenario_blueprint)

            scene_result = run_predictor(
                SituationGenerator,
                self.lm_creative,
                scenario_blueprint=blueprint.model_dump(),
                scene_number=1,
                previous_context="This is the opening scene.",
            )
            scene = self._build_scene(
                {
                    "scene_narrative": scene_result.scene_narrative,
                    "decision_point": scene_result.decision_point,
                    "time_pressure": scene_result.time_pressure,
                }
            )
            options_result = run_predictor(
                OptionDesigner,
                self.lm_creative,
                decision_point=scene.decision_point,
                scene_narrative=scene.scene_narrative,
                scenario_blueprint=blueprint.model_dump(),
            )

            options = self._build_options(options_result.options)
            logger.info("Started foresight scenario on theme '%s'", data.main_theme)
            return StartResponse(
                scene=scene,
                options=options,
                custom_option_prompt=options_result.custom_option_prompt,
                blueprint=blueprint,
                max_scenes=data.max_scenes,
            )
        except Exception as exc:
            logger.error("Scenario start failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc

    async def process_decision(self, data: DecisionRequest) -> DecisionResponse:
        """
        Processes a user's decision: evaluates it, determines consequences,
        generates an insight, and advances the story (or finalizes with a
        progress report when the scenario is complete).

        Args:
            data (DecisionRequest): The validated decision request.

        Returns:
            DecisionResponse: The evaluation, consequences, insight, and next step.

        Raises:
            GenerationError: If any pipeline step fails.
        """
        try:
            blueprint_raw = data.blueprint.model_dump()
            options_raw = [option.model_dump() for option in data.options]
            history_raw = [record.model_dump() for record in data.decision_history]

            eval_result = run_predictor(
                DecisionEvaluator,
                self.lm_analytical,
                user_choice=data.choice,
                user_reasoning=data.reasoning,
                options=options_raw,
                scenario_blueprint=blueprint_raw,
            )
            evaluation_raw = eval_result.evaluation
            evaluation = self._build_evaluation(evaluation_raw)

            insight_result = run_predictor(
                InsightGenerator,
                self.lm_analytical,
                evaluation=evaluation_raw,
                user_reasoning=data.reasoning,
                scene_number=data.scene_number,
                decision_history=history_raw or None,
            )
            insight = self._build_insight(insight_result.insight_report)

            cons_result = run_predictor(
                ConsequenceEngine,
                self.lm_creative,
                user_choice=data.choice,
                user_reasoning=data.reasoning,
                scenario_blueprint=blueprint_raw,
                scene_narrative=data.scene_narrative,
                evaluation=evaluation_raw,
            )
            consequences = self._build_consequences(cons_result.consequences)

            record = self._build_decision_record(data.scene_number, data.choice, evaluation)
            updated_history = data.decision_history + [record]

            if data.scene_number >= data.max_scenes:
                progress_result = run_predictor(
                    ProgressTracker,
                    self.lm_analytical,
                    decision_history=[item.model_dump() for item in updated_history],
                    main_theme=data.theme,
                )
                progress = self._build_progress(progress_result.progress_report)
                logger.info(
                    "Completed foresight scenario on theme '%s' after %d scenes",
                    data.theme,
                    data.scene_number,
                )
                return DecisionResponse(
                    evaluation=evaluation,
                    consequences=consequences,
                    insight=insight,
                    scenario_complete=True,
                    decision_history=updated_history,
                    progress_report=progress,
                )

            next_scene_number = data.scene_number + 1
            prev_summary = (
                f"Scene {data.scene_number}: User chose '{data.choice}'. "
                f"{consequences.world_state_update}"
            )

            next_result = run_predictor(
                NextSceneGenerator,
                self.lm_creative,
                consequences=cons_result.consequences,
                scenario_blueprint=blueprint_raw,
                scene_number=next_scene_number,
                previous_scene_summary=prev_summary,
                evaluation=evaluation_raw,
            )
            next_scene = self._build_scene(
                {
                    "scene_narrative": next_result.scene_narrative,
                    "decision_point": next_result.decision_point,
                    "time_pressure": next_result.time_pressure,
                    "difficulty_adjustment": next_result.difficulty_adjustment,
                },
                include_adjustment=True,
            )
            next_options_result = run_predictor(
                OptionDesigner,
                self.lm_creative,
                decision_point=next_scene.decision_point,
                scene_narrative=next_scene.scene_narrative,
                scenario_blueprint=blueprint_raw,
            )

            next_options = self._build_options(next_options_result.options)
            logger.info(
                "Processed scene %d on theme '%s' (next scene %d)",
                data.scene_number,
                data.theme,
                next_scene_number,
            )
            return DecisionResponse(
                evaluation=evaluation,
                consequences=consequences,
                insight=insight,
                scenario_complete=False,
                decision_history=updated_history,
                next_scene=next_scene,
                next_options=next_options,
                custom_option_prompt=next_options_result.custom_option_prompt,
            )
        except Exception as exc:
            logger.error("Decision processing failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
