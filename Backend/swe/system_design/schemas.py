from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

SeniorityLevel = Literal["junior", "mid", "senior", "staff"]


class ArchitectureComponent(BaseModel):
    """A component in the user's proposed architecture."""

    name: str = Field(..., description="Component name, e.g., 'Load Balancer'.")
    purpose: Optional[str] = Field(None, description="What the component does.")
    technology: Optional[str] = Field(None, description="Chosen technology, if specified.")


class Requirements(BaseModel):
    """Requirements the design must satisfy."""

    functional: List[str] = Field(default_factory=list, description="Functional requirements.")
    non_functional: List[str] = Field(default_factory=list, description="Scale, latency, and availability requirements.")
    constraints: List[str] = Field(default_factory=list, description="Hard constraints.")


class SystemDesignPromptRequest(BaseModel):
    """Request payload for generating a system design problem."""

    topic: str = Field(..., description="System to design, e.g., 'URL Shortener' or 'Rate Limiter'.")
    difficulty: SeniorityLevel = Field(..., description="Seniority level the problem targets.")
    scale_requirement: Optional[str] = Field(None, description="Expected scale, e.g., '100M DAU'. Inferred if omitted.")
    focus_areas: Optional[List[str]] = Field(None, description="Areas to emphasise, e.g., ['consistency', 'low_latency'].")


class SystemDesignPromptResponse(BaseModel):
    """Response model containing a generated system design problem."""

    problem_title: str = Field(..., description="A clear, concise title.")
    problem_statement: str = Field(..., description="Full problem statement with context and background.")
    functional_requirements: List[str] = Field(default_factory=list, description="Features the system must support.")
    non_functional_requirements: List[str] = Field(default_factory=list, description="Scale, performance, and availability requirements.")
    extended_requirements: List[str] = Field(default_factory=list, description="Bonus features for advanced candidates.")
    constraints: List[str] = Field(default_factory=list, description="Hard constraints.")
    estimated_traffic: Dict[str, str] = Field(default_factory=dict, description="Traffic estimates.")
    evaluation_criteria: List[str] = Field(default_factory=list, description="What the interviewer will look for.")
    suggested_time_allocation: Dict[str, str] = Field(default_factory=dict, description="Time breakdown in minutes.")


class RequirementsClarificationRequest(BaseModel):
    """Request payload for evaluating the requirements clarification phase."""

    problem_statement: str = Field(..., description="The system design problem given to the user.")
    user_questions: List[str] = Field(..., description="Clarifying questions the user asked.")
    user_priorities: Optional[List[str]] = Field(None, description="Features the user prioritised.")
    user_assumptions: Optional[List[str]] = Field(None, description="Assumptions the user stated.")


class QuestionAnalysis(BaseModel):
    """Analysis of one clarifying question."""

    question: str = Field(..., description="The user's question.")
    category: Literal["functional", "non_functional", "scale", "edge_case", "constraint", "priority"] = Field(..., description="Question category.")
    quality: Literal["excellent", "good", "neutral", "redundant", "misguided"] = Field(..., description="Quality of the question.")
    reasoning: str = Field(..., description="Why this quality was assigned.")


class MissedQuestion(BaseModel):
    """An important question the user did not ask."""

    question: str = Field(..., description="The missed question.")
    importance: Literal["critical", "important", "nice_to_have"] = Field(..., description="How important it was.")
    why_it_matters: str = Field(..., description="Why it matters.")


class AssumptionAnalysis(BaseModel):
    """Analysis of one stated assumption."""

    assumption: str = Field(..., description="What the user assumed.")
    validity: Literal["reasonable", "questionable", "incorrect"] = Field(..., description="Whether the assumption is valid.")
    feedback: str = Field(..., description="Comment on the assumption.")


class RequirementsClarificationResponse(BaseModel):
    """Response model containing the clarification evaluation."""

    clarification_score: float = Field(..., ge=0.0, le=100.0, description="Score for the quality of clarification.")
    questions_asked_analysis: List[QuestionAnalysis] = Field(default_factory=list, description="Analysis of each question.")
    missed_questions: List[MissedQuestion] = Field(default_factory=list, description="Important questions that were not asked.")
    assumptions_analysis: List[AssumptionAnalysis] = Field(default_factory=list, description="Analysis of each assumption.")
    priority_assessment: str = Field(..., description="Whether the user prioritised the right things.")
    overall_feedback: str = Field(..., description="Constructive feedback on the clarification phase.")
    red_flags: List[str] = Field(default_factory=list, description="Warning signs.")
    strengths: List[str] = Field(default_factory=list, description="What the user did well.")


class ArchitectureEvaluationRequest(BaseModel):
    """Request payload for evaluating a high-level architecture."""

    problem_statement: str = Field(..., description="The system design problem.")
    requirements: Requirements = Field(..., description="The requirements to satisfy.")
    user_architecture_description: str = Field(..., description="Text description of the architecture.")
    user_components: List[ArchitectureComponent] = Field(default_factory=list, description="Components the user proposed.")
    user_data_flow: str = Field(..., description="How data flows through the system.")


class ComponentEvaluation(BaseModel):
    """Evaluation of one proposed component."""

    component_name: str = Field(..., description="Name of the component.")
    necessity: Literal["essential", "useful", "redundant", "missing_but_needed"] = Field(..., description="How necessary it is.")
    appropriateness: Literal["excellent", "acceptable", "questionable", "inappropriate"] = Field(..., description="How appropriate it is.")
    feedback: str = Field(..., description="Specific feedback on this component.")


class MissingComponent(BaseModel):
    """A component the design should include but does not."""

    component: str = Field(..., description="What is missing.")
    why_needed: str = Field(..., description="Why it is necessary.")
    importance: Literal["critical", "important", "nice_to_have"] = Field(..., description="How important it is.")


class DataFlowAnalysis(BaseModel):
    """Analysis of the data flow through the design."""

    is_complete: bool = Field(..., description="Whether the data flow is complete.")
    bottlenecks: List[str] = Field(default_factory=list, description="Potential bottlenecks.")
    single_points_of_failure: List[str] = Field(default_factory=list, description="Single points of failure.")
    flow_clarity: Literal["clear", "somewhat_clear", "confusing"] = Field(..., description="How clearly the flow is described.")


class ArchitectureEvaluationResponse(BaseModel):
    """Response model containing the architecture evaluation."""

    architecture_score: float = Field(..., ge=0.0, le=100.0, description="Overall architecture quality.")
    completeness_score: float = Field(..., ge=0.0, le=100.0, description="Coverage of all requirements.")
    correctness_score: float = Field(..., ge=0.0, le=100.0, description="Technical correctness.")
    clarity_score: float = Field(..., ge=0.0, le=100.0, description="How clearly the design is communicated.")
    components_evaluation: List[ComponentEvaluation] = Field(default_factory=list, description="Evaluation of each component.")
    missing_components: List[MissingComponent] = Field(default_factory=list, description="Components that should be present.")
    data_flow_analysis: DataFlowAnalysis = Field(..., description="Analysis of the data flow.")
    requirements_coverage: Dict[str, bool] = Field(default_factory=dict, description="Whether each requirement is addressed.")
    strengths: List[str] = Field(default_factory=list, description="What is good about the architecture.")
    weaknesses: List[str] = Field(default_factory=list, description="What needs improvement.")
    overall_feedback: str = Field(..., description="Comprehensive feedback.")


class ComponentChoiceRequest(BaseModel):
    """Request payload for evaluating one technology choice."""

    component_name: str = Field(..., description="Name of the component, e.g., 'Cache'.")
    component_purpose: str = Field(..., description="What the component needs to do.")
    user_choice: str = Field(..., description="The technology the user chose.")
    user_justification: str = Field(..., description="The user's reasoning for the choice.")
    system_context: str = Field(..., description="Overall system context and requirements.")
    scale_requirements: Dict[str, str] = Field(default_factory=dict, description="Scale requirements, e.g., data_volume, read_rate.")


class JustificationAnalysis(BaseModel):
    """Analysis of the user's reasoning for a choice."""

    is_sound: bool = Field(..., description="Whether the reasoning is sound.")
    strengths_of_reasoning: List[str] = Field(default_factory=list, description="What the user got right.")
    gaps_in_reasoning: List[str] = Field(default_factory=list, description="What the user missed.")
    missing_considerations: List[str] = Field(default_factory=list, description="Factors the user should have considered.")


class TechnologyAlternative(BaseModel):
    """An alternative technology worth considering."""

    technology: str = Field(..., description="Alternative technology name.")
    why_consider: str = Field(..., description="When it would be better.")
    tradeoff_vs_user_choice: str = Field(..., description="What is gained or lost versus the user's choice.")


class ComponentChoiceResponse(BaseModel):
    """Response model containing the evaluation of a technology choice."""

    choice_rating: Literal["excellent", "good", "acceptable", "poor", "inappropriate"] = Field(..., description="Overall rating of the choice.")
    score: float = Field(..., ge=0.0, le=100.0, description="Score for this choice.")
    justification_analysis: JustificationAnalysis = Field(..., description="Analysis of the user's reasoning.")
    pros_of_choice: List[str] = Field(default_factory=list, description="Advantages for this use case.")
    cons_of_choice: List[str] = Field(default_factory=list, description="Disadvantages or risks.")
    alternatives: List[TechnologyAlternative] = Field(default_factory=list, description="Alternatives worth considering.")
    scale_fit: Literal["overkill", "perfect_fit", "adequate", "underpowered", "inappropriate"] = Field(..., description="Fit with the scale requirements.")
    potential_issues: List[str] = Field(default_factory=list, description="Problems that could arise at scale.")
    interview_feedback: str = Field(..., description="What an interviewer would say.")
    follow_up_questions: List[str] = Field(default_factory=list, description="Questions an interviewer would ask.")


class TradeoffDecision(BaseModel):
    """A major design decision made by the user."""

    decision: str = Field(..., description="What the user chose.")
    context: Optional[str] = Field(None, description="Why the user chose it, if stated.")
    category: Optional[str] = Field(None, description="e.g., 'database', 'cache', 'consistency_model'.")


class TradeoffAnalysisRequest(BaseModel):
    """Request payload for analysing the tradeoffs in a design."""

    system_context: str = Field(..., description="The system being designed and its requirements.")
    user_decisions: List[TradeoffDecision] = Field(..., description="Major design decisions.")


class TradeoffEntry(BaseModel):
    """Tradeoff analysis for one decision."""

    decision: str = Field(..., description="The decision being analysed.")
    gains: List[str] = Field(default_factory=list, description="What this choice provides.")
    costs: List[str] = Field(default_factory=list, description="What this choice sacrifices.")
    when_this_is_right: str = Field(..., description="Scenarios where this is the best choice.")
    when_this_is_wrong: str = Field(..., description="Scenarios where this is a bad choice.")
    alternative_with_opposite_tradeoff: str = Field(..., description="A choice that flips the tradeoff.")


class TradeoffAnalysisResponse(BaseModel):
    """Response model containing the tradeoff analysis."""

    tradeoff_analysis: List[TradeoffEntry] = Field(default_factory=list, description="Analysis for each decision.")
    consistency_vs_availability: Optional[Dict[str, str]] = Field(None, description="CAP positioning, if applicable.")
    latency_vs_consistency: Optional[Dict[str, str]] = Field(None, description="Latency and consistency tradeoffs, if applicable.")
    cost_vs_performance: Optional[Dict[str, str]] = Field(None, description="Cost and performance tradeoffs, if applicable.")
    complexity_vs_maintainability: Optional[Dict[str, str]] = Field(None, description="Complexity tradeoffs, if applicable.")
    overall_tradeoff_awareness: Literal["excellent", "good", "basic", "lacking"] = Field(..., description="How well the user understood tradeoffs.")
    key_insight: str = Field(..., description="The most important tradeoff insight for this design.")
    interview_tips: List[str] = Field(default_factory=list, description="Tips for discussing tradeoffs in interviews.")


class ScalabilityAssessmentRequest(BaseModel):
    """Request payload for assessing scalability."""

    problem_statement: str = Field(..., description="The system design problem.")
    user_architecture: str = Field(..., description="The user's architecture description.")
    user_components: List[ArchitectureComponent] = Field(default_factory=list, description="Components in the design.")
    current_scale: Dict[str, str] = Field(..., description="Current scale: DAU, RPS, storage.")
    growth_projections: Optional[Dict[str, str]] = Field(None, description="Expected growth, e.g., '10x in 2 years'.")


class ScalabilityBottleneck(BaseModel):
    """A bottleneck that appears as load grows."""

    component: str = Field(..., description="Where the bottleneck is.")
    severity: Literal["critical", "major", "minor"] = Field(..., description="Severity of the bottleneck.")
    trigger_load: str = Field(..., description="Load at which it becomes a problem.")
    symptom: str = Field(..., description="What would happen.")
    solution: str = Field(..., description="How to fix it.")


class SinglePointOfFailure(BaseModel):
    """A component whose failure would take down the system."""

    component: str = Field(..., description="The single point of failure.")
    impact: str = Field(..., description="What happens if it fails.")
    mitigation: str = Field(..., description="How to fix it.")


class ScalingStage(BaseModel):
    """How the system behaves at one scale."""

    scale: str = Field(..., description="Scale label, e.g., 'current', '10x', '100x'.")
    status: Literal["works_well", "strained", "breaking", "failed"] = Field(..., description="Status at this scale.")
    issues_at_this_scale: List[str] = Field(default_factory=list, description="Issues at this scale.")
    changes_needed: List[str] = Field(default_factory=list, description="Changes needed for this scale.")


class ScalabilityAssessmentResponse(BaseModel):
    """Response model containing the scalability assessment."""

    scalability_score: float = Field(..., ge=0.0, le=100.0, description="Overall scalability score.")
    scaling_strategy: Literal["horizontal", "vertical", "mixed", "unclear", "absent"] = Field(..., description="Primary scaling strategy.")
    bottleneck_analysis: List[ScalabilityBottleneck] = Field(default_factory=list, description="Identified bottlenecks.")
    single_points_of_failure: List[SinglePointOfFailure] = Field(default_factory=list, description="Single points of failure.")
    scaling_stages: List[ScalingStage] = Field(default_factory=list, description="Behaviour at each scale.")
    database_scalability: Dict[str, Any] = Field(default_factory=dict, description="Database scaling analysis.")
    cache_scalability: Dict[str, Any] = Field(default_factory=dict, description="Cache scaling analysis.")
    api_scalability: Dict[str, Any] = Field(default_factory=dict, description="API and service scaling analysis.")
    breaking_point: str = Field(..., description="Where and how the system would break under extreme load.")
    scalability_strengths: List[str] = Field(default_factory=list, description="What is good about the approach.")
    scalability_weaknesses: List[str] = Field(default_factory=list, description="What is weak about the approach.")
    recommendations: List[str] = Field(default_factory=list, description="Prioritised scalability improvements.")


class DataFlow(BaseModel):
    """A key data flow in the system."""

    flow_name: str = Field(..., description="Name of the flow, e.g., 'feed_loading'.")
    description: str = Field(..., description="Step-by-step data flow.")
    expected_frequency: str = Field(..., description="How often the flow runs, e.g., '10K/sec'.")


class BottleneckDetectionRequest(BaseModel):
    """Request payload for detecting performance bottlenecks."""

    user_architecture: str = Field(..., description="The user's architecture description.")
    user_data_flows: List[DataFlow] = Field(..., description="Key data flows in the system.")
    scale_requirements: Dict[str, str] = Field(..., description="Scale requirements, e.g., rps and p99 latency.")


class Bottleneck(BaseModel):
    """A performance bottleneck in the design."""

    id: str = Field(..., description="Unique identifier.")
    location: str = Field(..., description="Component or flow where the bottleneck occurs.")
    type: Literal["compute", "network", "database", "cache", "io", "lock_contention", "serialization"] = Field(..., description="Kind of bottleneck.")
    severity: Literal["critical", "major", "minor"] = Field(..., description="Severity.")
    trigger_condition: str = Field(..., description="When the bottleneck manifests.")
    impact: str = Field(..., description="What happens when it manifests.")
    estimated_impact: str = Field(..., description="Quantitative impact if possible.")
    root_cause: str = Field(..., description="Why the bottleneck exists.")
    solution: str = Field(..., description="How to fix it.")
    solution_complexity: Literal["simple", "moderate", "complex"] = Field(..., description="Effort to fix.")


class LatencyStep(BaseModel):
    """Latency estimate for one step of the critical flow."""

    step: str = Field(..., description="Name of the step.")
    estimated_latency_ms: str = Field(..., description="Estimated latency for this step.")
    is_optimizable: bool = Field(..., description="Whether this step can be improved.")
    optimization: Optional[str] = Field(None, description="How to improve it, if applicable.")


class HotPath(BaseModel):
    """A frequently executed path in the system."""

    path: str = Field(..., description="Description of the path.")
    frequency: str = Field(..., description="How often it runs.")
    risk: str = Field(..., description="Risk level at scale.")


class BottleneckDetectionResponse(BaseModel):
    """Response model containing the bottleneck analysis."""

    bottlenecks: List[Bottleneck] = Field(default_factory=list, description="Bottlenecks, sorted by severity.")
    latency_breakdown: List[LatencyStep] = Field(default_factory=list, description="Latency at each step of the critical flow.")
    throughput_limiting_factors: List[str] = Field(default_factory=list, description="What limits overall throughput.")
    hot_paths: List[HotPath] = Field(default_factory=list, description="The most frequently executed paths.")
    resource_contention_points: List[Dict[str, str]] = Field(default_factory=list, description="Where components compete for a resource.")
    total_bottlenecks_found: int = Field(..., ge=0, description="Total number of bottlenecks.")
    critical_bottlenecks_count: int = Field(..., ge=0, description="Number of critical bottlenecks.")
    executive_summary: str = Field(..., description="Summary of the most important performance concerns.")


class ComponentChoice(BaseModel):
    """A component and the technology chosen for it."""

    component: str = Field(..., description="Component name, e.g., 'Database'.")
    choice: str = Field(..., description="Technology chosen.")
    reason: Optional[str] = Field(None, description="Reason for the choice.")


class DesignScoreRequest(BaseModel):
    """Request payload for the final design score."""

    problem_statement: str = Field(..., description="The system design problem.")
    difficulty_level: SeniorityLevel = Field(..., description="Target seniority level.")
    requirements_clarification: Optional[str] = Field(None, description="Summary of the clarification phase.")
    high_level_design: str = Field(..., description="The user's high-level architecture.")
    component_choices: List[ComponentChoice] = Field(default_factory=list, description="Components and technologies chosen.")
    data_flow_description: str = Field(..., description="How data flows through the system.")
    tradeoff_discussion: Optional[str] = Field(None, description="The user's tradeoff discussion.")
    scalability_discussion: Optional[str] = Field(None, description="The user's scalability discussion.")
    time_taken_minutes: int = Field(..., ge=0, description="Total time taken for the design.")


class LevelAssessment(BaseModel):
    """Assessment of the candidate's demonstrated level."""

    demonstrated_level: SeniorityLevel = Field(..., description="Level the candidate demonstrated.")
    target_level: str = Field(..., description="Level the candidate was interviewing for.")
    is_match: bool = Field(..., description="Whether the demonstrated level matches the target.")
    reasoning: str = Field(..., description="Explanation of the assessment.")


class ImprovementItem(BaseModel):
    """One area to improve before the next interview."""

    area: str = Field(..., description="What to improve.")
    current_level: str = Field(..., description="Where the candidate is now.")
    target_level: str = Field(..., description="Where the candidate needs to be.")
    how_to_improve: str = Field(..., description="Specific actions to take.")
    priority: Literal["high", "medium", "low"] = Field(..., description="Priority of this item.")


class DesignScoreResponse(BaseModel):
    """Response model containing the final design score."""

    overall_score: float = Field(..., ge=0.0, le=100.0, description="Score for the entire design.")
    grade: Literal["Strong Hire", "Hire", "Weak Hire", "No Hire", "Strong No Hire"] = Field(..., description="Interview recommendation.")
    dimension_scores: Dict[str, float] = Field(default_factory=dict, description="Scores for each dimension.")
    level_assessment: LevelAssessment = Field(..., description="Assessment of the demonstrated level.")
    strengths: List[str] = Field(default_factory=list, description="Top strengths.")
    weaknesses: List[str] = Field(default_factory=list, description="Top weaknesses.")
    red_flags: List[str] = Field(default_factory=list, description="Serious concerns.")
    positive_signals: List[str] = Field(default_factory=list, description="Signals of strong engineering.")
    comparison_to_expected: str = Field(..., description="Comparison to a model answer.")
    detailed_feedback: str = Field(..., description="Comprehensive feedback.")
    improvement_roadmap: List[ImprovementItem] = Field(default_factory=list, description="Prioritised areas to improve.")
    would_pass_interview: bool = Field(..., description="Whether this would pass a real interview.")
    follow_up_topics: List[str] = Field(default_factory=list, description="Topics to study before the next interview.")
