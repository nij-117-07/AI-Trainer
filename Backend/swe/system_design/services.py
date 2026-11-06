import logging
from typing import Any, Dict, List, Literal, Optional, Type, TypeVar

import dspy
from pydantic import BaseModel

from core.dspy_utils import build_lm, run_predictor
from swe.system_design.schemas import (
    ArchitectureEvaluationRequest,
    ArchitectureEvaluationResponse,
    BottleneckDetectionRequest,
    BottleneckDetectionResponse,
    ComponentChoiceRequest,
    ComponentChoiceResponse,
    DesignScoreRequest,
    DesignScoreResponse,
    RequirementsClarificationRequest,
    RequirementsClarificationResponse,
    ScalabilityAssessmentRequest,
    ScalabilityAssessmentResponse,
    SystemDesignPromptRequest,
    SystemDesignPromptResponse,
    TradeoffAnalysisRequest,
    TradeoffAnalysisResponse,
)

logger = logging.getLogger(__name__)

ResponseT = TypeVar("ResponseT", bound=BaseModel)


class SystemDesignError(Exception):
    """Base exception for all system design module failures."""


class GenerationError(SystemDesignError):
    """Raised when the underlying DSPy pipeline fails to produce a result."""


class SystemDesignPrompter(dspy.Signature):
    """You are a principal engineer at a FAANG company who interviews candidates.
    Generate a realistic, well-scoped system design problem. Include clear
    functional requirements (what the system does), non-functional requirements
    (scale, latency, availability), and constraints. Problems should mirror
    real-world systems candidates actually get asked about in interviews."""

    topic: str = dspy.InputField(description="System to design, e.g., 'URL Shortener', 'News Feed', 'Rate Limiter', 'Chat Application'.")
    difficulty: Literal["junior", "mid", "senior", "staff"] = dspy.InputField(description="Seniority level the problem targets.")
    scale_requirement: Optional[str] = dspy.InputField(
        default=None,
        description="Expected scale, e.g., '100M DAU', '1M RPS'. If None, infer from topic."
    )
    focus_areas: Optional[List[str]] = dspy.InputField(
        default=None,
        description="Areas to emphasize, e.g., ['consistency', 'low_latency', 'fault_tolerance']."
    )

    problem_title: str = dspy.OutputField(description="A clear, concise title for the problem.")
    problem_statement: str = dspy.OutputField(description="Full problem statement with context and background.")
    functional_requirements: List[str] = dspy.OutputField(description="List of features the system must support.")
    non_functional_requirements: List[str] = dspy.OutputField(description="List of scale/performance/availability requirements.")
    extended_requirements: List[str] = dspy.OutputField(description="Bonus features to discuss if time permits (for advanced candidates).")
    constraints: List[str] = dspy.OutputField(description="Hard constraints, e.g., 'must support 99.99% uptime', 'writes must be consistent'.")
    estimated_traffic: Dict[str, str] = dspy.OutputField(description="""
        Traffic estimates:
        - 'daily_active_users': e.g., '50M'
        - 'requests_per_second_read': e.g., '100K'
        - 'requests_per_second_write': e.g., '10K'
        - 'storage_per_day': e.g., '500GB'
    """)
    evaluation_criteria: List[str] = dspy.OutputField(description="What the interviewer will specifically look for in the answer.")
    suggested_time_allocation: Dict[str, str] = dspy.OutputField(description="""
        Time breakdown in minutes:
        - 'requirements_clarification': time for clarifying scope
        - 'high_level_design': time for core architecture
        - 'deep_dive': time for component deep dives
        - 'scaling_discussion': time for scaling/bottlenecks
    """)


class RequirementsClarifier(dspy.Signature):
    """You are a senior interviewer evaluating the first phase of a system design
    interview: requirements clarification. Good engineers ask the right questions
    before jumping into design. Evaluate whether the user identified ambiguities,
    asked about scale, clarified edge cases, and prioritized features correctly."""

    problem_statement: str = dspy.InputField(description="The system design problem given to the user.")
    user_questions: List[str] = dspy.InputField(description="List of clarifying questions the user asked.")
    user_priorities: Optional[List[str]] = dspy.InputField(
        default=None,
        description="Features/requirements the user prioritized as most important."
    )
    user_assumptions: Optional[List[str]] = dspy.InputField(
        default=None,
        description="Assumptions the user explicitly stated."
    )

    clarification_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for quality of clarification.")
    questions_asked_analysis: List[Dict[str, Any]] = dspy.OutputField(description="""
        Analysis of each question asked. Each dict has:
        - 'question': the user's question
        - 'category': 'functional', 'non_functional', 'scale', 'edge_case', 'constraint', 'priority'
        - 'quality': 'excellent', 'good', 'neutral', 'redundant', or 'misguided'
        - 'reasoning': why this quality was assigned
    """)
    missed_questions: List[Dict[str, str]] = dspy.OutputField(description="""
        Important questions the user SHOULD have asked but didn't. Each dict has:
        - 'question': the missed question
        - 'importance': 'critical', 'important', or 'nice_to_have'
        - 'why_it_matters': explanation
    """)
    assumptions_analysis: List[Dict[str, str]] = dspy.OutputField(description="""
        Analysis of user's stated assumptions. Each dict has:
        - 'assumption': what the user assumed
        - 'validity': 'reasonable', 'questionable', or 'incorrect'
        - 'feedback': comment on the assumption
    """)
    priority_assessment: str = dspy.OutputField(description="Evaluation of whether the user prioritized the right things.")
    overall_feedback: str = dspy.OutputField(description="Constructive feedback on the clarification phase.")
    red_flags: List[str] = dspy.OutputField(description="Warning signs (e.g., jumped straight to design without asking questions).")
    strengths: List[str] = dspy.OutputField(description="What the user did well in this phase.")


class ArchitectureDiagramEvaluator(dspy.Signature):
    """You are a staff engineer reviewing a candidate's high-level system design.
    Evaluate the user's proposed architecture: components chosen, how they
    connect, data flow, and whether the design addresses the requirements.
    The user describes their architecture in text (since we can't process
    actual diagrams). Focus on completeness, correctness, and clarity."""

    problem_statement: str = dspy.InputField(description="The system design problem.")
    requirements: Dict[str, List[str]] = dspy.InputField(description="""
        The requirements to satisfy:
        - 'functional': list of functional requirements
        - 'non_functional': list of non-functional requirements
        - 'constraints': list of constraints
    """)
    user_architecture_description: str = dspy.InputField(description="The user's text description of their architecture (components, connections, data flow).")
    user_components: List[Dict[str, str]] = dspy.InputField(description="""
        List of components the user proposed. Each dict has:
        - 'name': component name
        - 'purpose': what it does
        - 'technology': chosen tech (if specified)
    """)
    user_data_flow: str = dspy.InputField(description="Description of how data flows through the system.")

    architecture_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for overall architecture quality.")
    completeness_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for covering all requirements.")
    correctness_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for technical correctness.")
    clarity_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for how clearly the design is communicated.")
    components_evaluation: List[Dict[str, Any]] = dspy.OutputField(description="""
        Evaluation of each proposed component. Each dict has:
        - 'component_name': name of the component
        - 'necessity': 'essential', 'useful', 'redundant', or 'missing_but_needed'
        - 'appropriateness': 'excellent', 'acceptable', 'questionable', or 'inappropriate'
        - 'feedback': specific feedback on this component
    """)
    missing_components: List[Dict[str, str]] = dspy.OutputField(description="""
        Components that should be in the design but aren't. Each dict has:
        - 'component': what's missing
        - 'why_needed': why it's necessary
        - 'importance': 'critical', 'important', or 'nice_to_have'
    """)
    data_flow_analysis: Dict[str, Any] = dspy.OutputField(description="""
        Analysis of the data flow:
        - 'is_complete': boolean
        - 'bottlenecks': list of potential bottlenecks
        - 'single_points_of_failure': list of SPOFs
        - 'flow_clarity': 'clear', 'somewhat_clear', or 'confusing'
    """)
    requirements_coverage: Dict[str, bool] = dspy.OutputField(description="Map of each requirement to whether the design addresses it.")
    strengths: List[str] = dspy.OutputField(description="What's good about the architecture.")
    weaknesses: List[str] = dspy.OutputField(description="What needs improvement.")
    overall_feedback: str = dspy.OutputField(description="Comprehensive feedback paragraph.")


class ComponentChoiceEvaluator(dspy.Signature):
    """You are a principal engineer evaluating a candidate's technology choices
    for specific system components. For each choice, assess whether it's
    appropriate for the use case, scale, and constraints. Consider alternatives
    and explain tradeoffs. Be fair — multiple valid choices often exist."""

    component_name: str = dspy.InputField(description="Name of the component, e.g., 'Database', 'Cache', 'Message Queue'.")
    component_purpose: str = dspy.InputField(description="What this component needs to do in the system.")
    user_choice: str = dspy.InputField(description="The technology the user chose, e.g., 'PostgreSQL', 'Redis', 'Kafka'.")
    user_justification: str = dspy.InputField(description="The user's reasoning for this choice.")
    system_context: str = dspy.InputField(description="Overall system context and requirements.")
    scale_requirements: Dict[str, str] = dspy.InputField(description="""
        Scale requirements affecting this component:
        - 'data_volume': e.g., '10TB over 5 years'
        - 'read_rate': e.g., '100K RPS'
        - 'write_rate': e.g., '10K WPS'
        - 'latency_requirement': e.g., '<50ms p99'
    """)

    choice_rating: Literal["excellent", "good", "acceptable", "poor", "inappropriate"] = dspy.OutputField(
        description="Overall rating of the technology choice."
    )
    score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for this specific choice.")
    justification_analysis: Dict[str, Any] = dspy.OutputField(description="""
        Analysis of the user's reasoning:
        - 'is_sound': boolean
        - 'strengths_of_reasoning': what they got right
        - 'gaps_in_reasoning': what they missed
        - 'missing_considerations': factors they should have considered
    """)
    pros_of_choice: List[str] = dspy.OutputField(description="Genuine advantages of the chosen technology for this use case.")
    cons_of_choice: List[str] = dspy.OutputField(description="Disadvantages or risks of the chosen technology.")
    alternatives: List[Dict[str, Any]] = dspy.OutputField(description="""
        Alternative technologies worth considering. Each dict has:
        - 'technology': alternative name
        - 'why_consider': when it would be better
        - 'tradeoff_vs_user_choice': what you gain/lose vs user's choice
    """)
    scale_fit: Literal["overkill", "perfect_fit", "adequate", "underpowered", "inappropriate"] = dspy.OutputField(
        description="Whether the choice fits the scale requirements."
    )
    potential_issues: List[str] = dspy.OutputField(description="Potential problems that could arise with this choice at scale.")
    interview_feedback: str = dspy.OutputField(description="What an interviewer would say about this choice.")
    follow_up_questions: List[str] = dspy.OutputField(description="Questions an interviewer would ask to probe deeper.")


class TradeoffAnalyzer(dspy.Signature):
    """You are a staff engineer helping a candidate understand the tradeoffs
    in their system design. For each major decision the user made, identify
    what they gained AND what they gave up. Good engineers understand that
    every choice has costs. Help them see the full picture."""

    system_context: str = dspy.InputField(description="The system being designed and its requirements.")
    user_decisions: List[Dict[str, str]] = dspy.InputField(description="""
        List of major design decisions the user made. Each dict has:
        - 'decision': what they chose
        - 'context': why they chose it (if stated)
        - 'category': 'database', 'cache', 'api_style', 'consistency_model', 'scaling_strategy', etc.
    """)

    tradeoff_analysis: List[Dict[str, Any]] = dspy.OutputField(description="""
        Detailed tradeoff analysis for each decision. Each dict has:
        - 'decision': the decision being analyzed
        - 'gains': list of what this choice provides
        - 'costs': list of what this choice sacrifices
        - 'when_this_is_right': scenarios where this is the best choice
        - 'when_this_is_wrong': scenarios where this would be a bad choice
        - 'alternative_with_opposite_tradeoff': a choice that flips the tradeoff
    """)
    consistency_vs_availability: Optional[Dict[str, str]] = dspy.OutputField(description="""
        If applicable, analysis of where the user landed on the CAP theorem spectrum:
        - 'choice': 'CP', 'AP', or 'mixed'
        - 'justification': why they made this choice
        - 'implications': what this means for the system
        - 'was_appropriate': 'yes', 'no', or 'depends'
    """)
    latency_vs_consistency: Optional[Dict[str, str]] = dspy.OutputField(description="""
        If applicable, analysis of latency/consistency tradeoffs.
    """)
    cost_vs_performance: Optional[Dict[str, str]] = dspy.OutputField(description="""
        If applicable, analysis of infrastructure cost vs performance.
    """)
    complexity_vs_maintainability: Optional[Dict[str, str]] = dspy.OutputField(description="""
        If applicable, analysis of system complexity vs ease of maintenance.
    """)
    overall_tradeoff_awareness: Literal["excellent", "good", "basic", "lacking"] = dspy.OutputField(
        description="How well the user demonstrated understanding of tradeoffs."
    )
    key_insight: str = dspy.OutputField(description="The single most important tradeoff insight for this design.")
    interview_tips: List[str] = dspy.OutputField(description="Tips for discussing tradeoffs better in interviews.")


class ScalabilityAssessor(dspy.Signature):
    """You are a scalability expert evaluating whether a system design can
    handle growth. Analyze the user's design for scalability: horizontal vs
    vertical scaling, bottlenecks, single points of failure, and how the
    system behaves at 10x and 100x current load. Identify the breaking points."""

    problem_statement: str = dspy.InputField(description="The system design problem.")
    user_architecture: str = dspy.InputField(description="The user's architecture description.")
    user_components: List[Dict[str, str]] = dspy.InputField(description="Components in the user's design.")
    current_scale: Dict[str, str] = dspy.InputField(description="Current scale requirements (DAU, RPS, storage).")
    growth_projections: Optional[Dict[str, str]] = dspy.InputField(
        default=None,
        description="Expected growth, e.g., '10x in 2 years'."
    )

    scalability_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for overall scalability.")
    scaling_strategy: Literal["horizontal", "vertical", "mixed", "unclear", "absent"] = dspy.OutputField(
        description="The primary scaling strategy in the design."
    )
    bottleneck_analysis: List[Dict[str, Any]] = dspy.OutputField(description="""
        Identified bottlenecks. Each dict has:
        - 'component': where the bottleneck is
        - 'severity': 'critical', 'major', or 'minor'
        - 'trigger_load': at what load this becomes a problem
        - 'symptom': what would happen (latency spike, failures, etc.)
        - 'solution': how to fix it
    """)
    single_points_of_failure: List[Dict[str, str]] = dspy.OutputField(description="""
        Single points of failure. Each dict has:
        - 'component': what's a SPOF
        - 'impact': what happens if it fails
        - 'mitigation': how to fix it
    """)
    scaling_stages: List[Dict[str, Any]] = dspy.OutputField(description="""
        How the system behaves at different scales. Each dict has:
        - 'scale': e.g., 'current', '10x', '100x'
        - 'status': 'works_well', 'strained', 'breaking', 'failed'
        - 'issues_at_this_scale': list of issues
        - 'changes_needed': what needs to change to handle this scale
    """)
    database_scalability: Dict[str, Any] = dspy.OutputField(description="""
        Analysis of database scaling:
        - 'strategy': 'sharding', 'replication', 'partitioning', 'none'
        - 'adequacy': 'good', 'adequate', 'poor'
        - 'concerns': list of concerns
    """)
    cache_scalability: Dict[str, Any] = dspy.OutputField(description="Analysis of cache layer scaling.")
    api_scalability: Dict[str, Any] = dspy.OutputField(description="Analysis of API/service layer scaling.")
    breaking_point: str = dspy.OutputField(description="Description of where and how the system would break under extreme load.")
    scalability_strengths: List[str] = dspy.OutputField(description="What's good about the scalability approach.")
    scalability_weaknesses: List[str] = dspy.OutputField(description="What's weak about the scalability approach.")
    recommendations: List[str] = dspy.OutputField(description="Prioritized list of scalability improvements.")


class BottleneckDetector(dspy.Signature):
    """You are a performance engineer hunting for bottlenecks in a system design.
    Analyze the architecture to find where performance will degrade under load.
    Consider: network hops, serialization, database queries, cache misses,
    lock contention, cold starts, and resource exhaustion. Be specific about
    where, when, and why each bottleneck occurs."""

    user_architecture: str = dspy.InputField(description="The user's architecture description.")
    user_data_flows: List[Dict[str, str]] = dspy.InputField(description="""
        Key data flows in the system. Each dict has:
        - 'flow_name': e.g., 'user_login', 'post_creation', 'feed_loading'
        - 'description': step-by-step data flow
        - 'expected_frequency': e.g., '10K/sec', '100/sec'
    """)
    scale_requirements: Dict[str, str] = dspy.InputField(description="Scale requirements (RPS, latency targets, etc.).")

    bottlenecks: List[Dict[str, Any]] = dspy.OutputField(description="""
        Identified bottlenecks, sorted by severity. Each dict has:
        - 'id': unique identifier
        - 'location': component/flow where bottleneck occurs
        - 'type': 'compute', 'network', 'database', 'cache', 'io', 'lock_contention', 'serialization'
        - 'severity': 'critical', 'major', 'minor'
        - 'trigger_condition': when this bottleneck manifests
        - 'impact': what happens (latency increase, throughput drop, etc.)
        - 'estimated_impact': quantitative if possible (e.g., 'p99 latency jumps to 500ms')
        - 'root_cause': why this bottleneck exists
        - 'solution': how to fix it
        - 'solution_complexity': 'simple', 'moderate', or 'complex'
    """)
    latency_breakdown: List[Dict[str, Any]] = dspy.OutputField(description="""
        For the most critical flow, break down latency at each step:
        - 'step': name of the step
        - 'estimated_latency_ms': estimated latency
        - 'is_optimizable': boolean
        - 'optimization': how to improve if applicable
    """)
    throughput_limiting_factors: List[str] = dspy.OutputField(description="What limits overall system throughput.")
    hot_paths: List[Dict[str, str]] = dspy.OutputField(description="""
        Hot paths in the system (most frequently executed):
        - 'path': description of the path
        - 'frequency': how often it runs
        - 'risk': risk level at scale
    """)
    resource_contention_points: List[Dict[str, str]] = dspy.OutputField(description="Where multiple components compete for the same resource.")
    total_bottlenecks_found: int = dspy.OutputField(description="Total count of bottlenecks identified.")
    critical_bottlenecks_count: int = dspy.OutputField(description="Count of critical-severity bottlenecks.")
    executive_summary: str = dspy.OutputField(description="One-paragraph summary of the most important performance concerns.")


class DesignScoreEvaluator(dspy.Signature):
    """You are a principal engineer conducting a system design interview.
    Given the user's complete design submission (requirements clarification,
    architecture, component choices, tradeoff discussions, scalability analysis),
    produce a comprehensive score across multiple dimensions. This is the
    final evaluation that determines if the candidate passes."""

    problem_statement: str = dspy.InputField(description="The system design problem.")
    difficulty_level: Literal["junior", "mid", "senior", "staff"] = dspy.InputField(description="Target seniority level.")
    requirements_clarification: Optional[str] = dspy.InputField(
        default=None,
        description="Summary of the user's clarification phase (questions asked, assumptions made)."
    )
    high_level_design: str = dspy.InputField(description="The user's high-level architecture description.")
    component_choices: List[Dict[str, str]] = dspy.InputField(description="Components and technologies chosen.")
    data_flow_description: str = dspy.InputField(description="How data flows through the system.")
    tradeoff_discussion: Optional[str] = dspy.InputField(
        default=None,
        description="The user's discussion of tradeoffs they made."
    )
    scalability_discussion: Optional[str] = dspy.InputField(
        default=None,
        description="The user's discussion of how the system scales."
    )
    time_taken_minutes: int = dspy.InputField(description="Total time taken for the design.")

    overall_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for the entire design.")
    grade: Literal["Strong Hire", "Hire", "Weak Hire", "No Hire", "Strong No Hire"] = dspy.OutputField(
        description="Interview recommendation."
    )
    dimension_scores: Dict[str, float] = dspy.OutputField(description="""
        Scores (0-100) for each dimension:
        - 'requirements_clarification': quality of initial questions
        - 'high_level_design': overall architecture quality
        - 'component_knowledge': depth of technology understanding
        - 'data_modeling': quality of data model/schema design
        - 'api_design': quality of API/interface design
        - 'tradeoff_awareness': understanding of design tradeoffs
        - 'scalability_thinking': ability to think about scale
        - 'communication': clarity of explanation
        - 'problem_solving': approach to unknowns and edge cases
    """)
    level_assessment: Dict[str, Any] = dspy.OutputField(description="""
        Assessment of what level the candidate is performing at:
        - 'demonstrated_level': 'junior', 'mid', 'senior', or 'staff'
        - 'target_level': the level they were interviewing for
        - 'is_match': boolean
        - 'reasoning': explanation
    """)
    strengths: List[str] = dspy.OutputField(description="Top strengths demonstrated in the design.")
    weaknesses: List[str] = dspy.OutputField(description="Top weaknesses or gaps.")
    red_flags: List[str] = dspy.OutputField(description="Serious concerns (if any).")
    positive_signals: List[str] = dspy.OutputField(description="Positive signals that indicate strong engineering.")
    comparison_to_expected: str = dspy.OutputField(description="How this design compares to a 'model answer' for this problem.")
    detailed_feedback: str = dspy.OutputField(description="Comprehensive feedback paragraph covering all aspects.")
    improvement_roadmap: List[Dict[str, str]] = dspy.OutputField(description="""
        Prioritized list of areas to improve. Each dict has:
        - 'area': what to improve
        - 'current_level': where they are now
        - 'target_level': where they need to be
        - 'how_to_improve': specific actions to take
        - 'priority': 'high', 'medium', or 'low'
    """)
    would_pass_interview: bool = dspy.OutputField(description="True if this would pass a real interview at the target level.")
    follow_up_topics: List[str] = dspy.OutputField(description="Topics to study before the next interview.")


class SystemDesignService:
    """Business layer wrapping the DSPy system design pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.2)

    async def generate_prompt(self, data: SystemDesignPromptRequest) -> SystemDesignPromptResponse:
        """
        Generates a system design problem with requirements and traffic estimates.

        Args:
            data: The validated prompt generation request.

        Returns:
            SystemDesignPromptResponse: The generated problem.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce the problem.
        """
        return self._predict(
            SystemDesignPrompter,
            SystemDesignPromptResponse,
            topic=data.topic,
            difficulty=data.difficulty,
            scale_requirement=data.scale_requirement,
            focus_areas=data.focus_areas,
        )

    async def clarify_requirements(self, data: RequirementsClarificationRequest) -> RequirementsClarificationResponse:
        """
        Evaluates the questions and assumptions from the clarification phase.

        Args:
            data: The validated clarification request.

        Returns:
            RequirementsClarificationResponse: The clarification score and feedback.

        Raises:
            GenerationError: If the DSPy pipeline fails to evaluate the clarification.
        """
        return self._predict(
            RequirementsClarifier,
            RequirementsClarificationResponse,
            problem_statement=data.problem_statement,
            user_questions=data.user_questions,
            user_priorities=data.user_priorities,
            user_assumptions=data.user_assumptions,
        )

    async def evaluate_architecture(self, data: ArchitectureEvaluationRequest) -> ArchitectureEvaluationResponse:
        """
        Evaluates the proposed high-level architecture against the requirements.

        Args:
            data: The validated architecture evaluation request.

        Returns:
            ArchitectureEvaluationResponse: Scores, missing components, and data flow analysis.

        Raises:
            GenerationError: If the DSPy pipeline fails to evaluate the architecture.
        """
        return self._predict(
            ArchitectureDiagramEvaluator,
            ArchitectureEvaluationResponse,
            problem_statement=data.problem_statement,
            requirements=data.requirements.model_dump(),
            user_architecture_description=data.user_architecture_description,
            user_components=[c.model_dump(exclude_none=True) for c in data.user_components],
            user_data_flow=data.user_data_flow,
        )

    async def evaluate_component_choice(self, data: ComponentChoiceRequest) -> ComponentChoiceResponse:
        """
        Evaluates one technology choice for a component.

        Args:
            data: The validated component choice request.

        Returns:
            ComponentChoiceResponse: The rating, alternatives, and interview feedback.

        Raises:
            GenerationError: If the DSPy pipeline fails to evaluate the choice.
        """
        return self._predict(
            ComponentChoiceEvaluator,
            ComponentChoiceResponse,
            component_name=data.component_name,
            component_purpose=data.component_purpose,
            user_choice=data.user_choice,
            user_justification=data.user_justification,
            system_context=data.system_context,
            scale_requirements=data.scale_requirements,
        )

    async def analyze_tradeoffs(self, data: TradeoffAnalysisRequest) -> TradeoffAnalysisResponse:
        """
        Analyses the gains and costs of each major design decision.

        Args:
            data: The validated tradeoff analysis request.

        Returns:
            TradeoffAnalysisResponse: Tradeoff analysis and overall awareness rating.

        Raises:
            GenerationError: If the DSPy pipeline fails to analyse the tradeoffs.
        """
        return self._predict(
            TradeoffAnalyzer,
            TradeoffAnalysisResponse,
            system_context=data.system_context,
            user_decisions=[d.model_dump(exclude_none=True) for d in data.user_decisions],
        )

    async def assess_scalability(self, data: ScalabilityAssessmentRequest) -> ScalabilityAssessmentResponse:
        """
        Assesses how the design behaves at higher load and identifies breaking points.

        Args:
            data: The validated scalability assessment request.

        Returns:
            ScalabilityAssessmentResponse: Scalability score, bottlenecks, and scaling stages.

        Raises:
            GenerationError: If the DSPy pipeline fails to assess scalability.
        """
        return self._predict(
            ScalabilityAssessor,
            ScalabilityAssessmentResponse,
            problem_statement=data.problem_statement,
            user_architecture=data.user_architecture,
            user_components=[c.model_dump(exclude_none=True) for c in data.user_components],
            current_scale=data.current_scale,
            growth_projections=data.growth_projections,
        )

    async def detect_bottlenecks(self, data: BottleneckDetectionRequest) -> BottleneckDetectionResponse:
        """
        Finds performance bottlenecks along the key data flows.

        Args:
            data: The validated bottleneck detection request.

        Returns:
            BottleneckDetectionResponse: Bottlenecks, latency breakdown, and hot paths.

        Raises:
            GenerationError: If the DSPy pipeline fails to detect bottlenecks.
        """
        return self._predict(
            BottleneckDetector,
            BottleneckDetectionResponse,
            user_architecture=data.user_architecture,
            user_data_flows=[f.model_dump() for f in data.user_data_flows],
            scale_requirements=data.scale_requirements,
        )

    async def score_design(self, data: DesignScoreRequest) -> DesignScoreResponse:
        """
        Produces the final multi-dimension score for a complete design submission.

        Args:
            data: The validated design score request.

        Returns:
            DesignScoreResponse: Overall score, grade, dimension scores, and roadmap.

        Raises:
            GenerationError: If the DSPy pipeline fails to score the design.
        """
        return self._predict(
            DesignScoreEvaluator,
            DesignScoreResponse,
            problem_statement=data.problem_statement,
            difficulty_level=data.difficulty_level,
            requirements_clarification=data.requirements_clarification,
            high_level_design=data.high_level_design,
            component_choices=[c.model_dump(exclude_none=True) for c in data.component_choices],
            data_flow_description=data.data_flow_description,
            tradeoff_discussion=data.tradeoff_discussion,
            scalability_discussion=data.scalability_discussion,
            time_taken_minutes=data.time_taken_minutes,
        )

    def _predict(
        self,
        signature: Type[dspy.Signature],
        response_model: Type[ResponseT],
        **inputs: Any,
    ) -> ResponseT:
        """
        Runs a signature and maps its outputs onto a response model.

        Args:
            signature: The DSPy signature class to execute.
            response_model: The Pydantic model that shapes the response.
            **inputs: Input fields for the signature.

        Returns:
            ResponseT: The validated response built from the prediction outputs.

        Raises:
            GenerationError: If the pipeline or response validation fails.
        """
        try:
            logger.info("Running %s", signature.__name__)
            prediction = run_predictor(signature, self.lm, **inputs)
            fields = {name: getattr(prediction, name) for name in response_model.model_fields}
            return response_model(**fields)
        except Exception as exc:
            logger.error("%s failed: %s", signature.__name__, exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
