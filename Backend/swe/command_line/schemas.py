from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

ChallengeDifficulty = Literal["beginner", "intermediate", "advanced", "expert"]
ChallengeEnvironment = Literal["linux", "macos", "windows_powershell", "windows_cmd"]
ExplanationDepth = Literal["beginner", "intermediate", "advanced"]
OptimizationPriority = Literal["speed", "readability", "portability", "resource_usage", "elegance"]


class ChallengeGenerationRequest(BaseModel):
    """Request payload for generating a CLI challenge."""

    topic: str = Field(..., description="CLI topic area, e.g., 'text processing' or 'permissions'.")
    difficulty: ChallengeDifficulty = Field(..., description="Difficulty level of the challenge.")
    environment: ChallengeEnvironment = Field(..., description="Target operating system or shell environment.")
    scenario_context: Optional[str] = Field(None, description="Optional real-world scenario framing.")


class ChallengeGenerationResponse(BaseModel):
    """Response model containing a generated CLI challenge."""

    challenge_title: str = Field(..., description="A short, descriptive title for the challenge.")
    scenario: str = Field(..., description="Real-world scenario that motivates the task.")
    task_description: str = Field(..., description="What the user must accomplish.")
    initial_filesystem: Dict[str, Any] = Field(default_factory=dict, description="Simulated starting file system state.")
    expected_command: str = Field(..., description="One ideal command or pipeline that solves the challenge.")
    acceptable_alternatives: List[str] = Field(default_factory=list, description="Other valid solutions.")
    expected_output: str = Field(..., description="The exact expected terminal output.")
    evaluation_criteria: List[str] = Field(default_factory=list, description="Criteria a correct answer must meet.")
    key_commands_tested: List[str] = Field(default_factory=list, description="Commands or concepts the challenge tests.")
    learning_objective: str = Field(..., description="What the user should learn from this challenge.")


class ChallengeDetails(BaseModel):
    """Challenge details passed back to the evaluator and hint generator."""

    task_description: str = Field(..., description="What needs to be done.")
    initial_filesystem: Dict[str, Any] = Field(default_factory=dict, description="The starting environment.")
    expected_output: Optional[str] = Field(None, description="What correct output looks like.")
    evaluation_criteria: List[str] = Field(default_factory=list, description="Criteria to check.")
    expected_command: Optional[str] = Field(None, description="The reference solution.")
    acceptable_alternatives: List[str] = Field(default_factory=list, description="Other valid solutions.")


class CommandEvaluationRequest(BaseModel):
    """Request payload for judging a user's command against a challenge."""

    challenge: ChallengeDetails = Field(..., description="The challenge the command is answering.")
    user_command: str = Field(..., description="The command or pipeline the user submitted.")
    simulated_output: Optional[str] = Field(None, description="Output the command would produce, if available.")
    environment: str = Field(..., description="The shell environment, e.g., 'linux' or 'powershell'.")


class CriterionResult(BaseModel):
    """Evaluation of a single challenge criterion."""

    criterion: str = Field(..., description="The criterion text.")
    met: bool = Field(..., description="Whether the criterion was met.")
    explanation: str = Field(..., description="Why it was or was not met.")


class CommandComponent(BaseModel):
    """Breakdown of one part of the user's command."""

    component: str = Field(..., description="The part of the command.")
    purpose: str = Field(..., description="What this part does.")
    correctness: str = Field(..., description="Whether this part is correct.")


class CommandEvaluationResponse(BaseModel):
    """Response model containing the verdict for a command."""

    is_correct: bool = Field(..., description="True if the command correctly solves the challenge.")
    score: float = Field(..., ge=0.0, le=100.0, description="Score from 0.0 to 100.0.")
    verdict: Literal["Perfect", "Correct", "Partially Correct", "Incorrect", "Dangerous"] = Field(..., description="Final verdict.")
    output_matches: bool = Field(..., description="Whether the simulated output matches the expected output.")
    criteria_met: List[CriterionResult] = Field(default_factory=list, description="Result for each criterion.")
    command_breakdown: List[CommandComponent] = Field(default_factory=list, description="What each part of the command does.")
    efficiency_rating: Literal["optimal", "good", "acceptable", "inefficient"] = Field(..., description="Efficiency compared to the ideal solution.")
    feedback: str = Field(..., description="Constructive feedback explaining the evaluation.")
    warnings: List[str] = Field(default_factory=list, description="Portability, deprecation, or safety warnings.")


class CommandHintRequest(BaseModel):
    """Request payload for a progressive CLI hint."""

    challenge: ChallengeDetails = Field(..., description="The challenge the user is stuck on.")
    user_attempt: Optional[str] = Field(None, description="The user's current attempt, if any.")
    user_error: Optional[str] = Field(None, description="Any error message the user is seeing.")
    hint_level: Literal[1, 2, 3] = Field(..., description="1 = tool category, 2 = specific command and flags, 3 = command structure.")
    hints_already_given: Optional[List[str]] = Field(None, description="Previous hints, to avoid repetition.")


class KeyFlag(BaseModel):
    """A flag or option relevant to the challenge."""

    flag: str = Field(..., description="The flag, e.g., '-r' or '--verbose'.")
    purpose: str = Field(..., description="What the flag does.")
    why_relevant: str = Field(..., description="Why it matters for this challenge.")


class CommandHintResponse(BaseModel):
    """Response model containing a CLI hint."""

    hint_text: str = Field(..., description="The hint content at the requested level.")
    command_category: str = Field(..., description="The category of command needed.")
    suggested_commands: List[str] = Field(default_factory=list, description="Commands the user should consider.")
    key_flags: List[KeyFlag] = Field(default_factory=list, description="Important flags to consider.")
    common_mistakes: List[str] = Field(default_factory=list, description="Common mistakes on this type of challenge.")
    man_page_tip: str = Field(..., description="A tip that would appear in the relevant man page.")
    guiding_question: str = Field(..., description="A Socratic question to guide the user.")


class PipelineDesignRequest(BaseModel):
    """Request payload for analysing a multi-command pipeline."""

    user_pipeline: str = Field(..., description="The full pipeline, which may include |, >, &&, $(), etc.")
    task_goal: str = Field(..., description="What the pipeline is supposed to accomplish.")
    environment: str = Field(..., description="Shell environment, e.g., 'bash' or 'zsh'.")
    input_data_sample: Optional[str] = Field(None, description="Sample input data the pipeline would process.")


class PipelineStage(BaseModel):
    """Breakdown of a single pipeline stage."""

    stage_number: int = Field(..., description="Order of the stage in the pipeline.")
    command: str = Field(..., description="The command at this stage.")
    input_source: str = Field(..., description="Where input comes from.")
    output_format: str = Field(..., description="What this stage outputs.")
    purpose: str = Field(..., description="What this stage accomplishes.")
    correctness: Literal["correct", "incorrect", "questionable"] = Field(..., description="Correctness of this stage.")


class PipelineIssue(BaseModel):
    """A problem found in the pipeline."""

    stage: str = Field(..., description="The stage with the issue.")
    issue_type: Literal["logic", "syntax", "quoting", "portability", "performance"] = Field(..., description="Category of the issue.")
    description: str = Field(..., description="What the problem is.")
    fix: str = Field(..., description="How to fix it.")


class PipelineDesignResponse(BaseModel):
    """Response model containing the pipeline analysis."""

    pipeline_stages: List[PipelineStage] = Field(default_factory=list, description="Breakdown of each stage.")
    data_flow_diagram: str = Field(..., description="ASCII representation of data flow.")
    is_correct: bool = Field(..., description="Whether the pipeline achieves the goal.")
    issues: List[PipelineIssue] = Field(default_factory=list, description="Problems found.")
    improved_pipeline: str = Field(..., description="An improved version of the pipeline.")
    one_liner_alternative: Optional[str] = Field(None, description="A more concise one-liner, if possible.")
    scripting_recommendation: Optional[str] = Field(None, description="Suggestion to convert to a script, if too complex.")
    portability_notes: List[str] = Field(default_factory=list, description="Notes on cross-system compatibility.")
    key_concepts: List[str] = Field(default_factory=list, description="Shell concepts demonstrated.")


class ShellScriptEvaluationRequest(BaseModel):
    """Request payload for reviewing a shell script."""

    user_script: str = Field(..., description="The shell script written by the user.")
    task_requirement: str = Field(..., description="What the script is supposed to accomplish.")
    environment: str = Field(..., description="Target shell, e.g., 'bash', 'zsh', or 'sh'.")
    test_inputs: Optional[List[Dict[str, str]]] = Field(None, description="Optional test inputs with expected outputs.")


class ScriptIssue(BaseModel):
    """A problem found in the shell script."""

    line: str = Field(..., description="Line number or range.")
    severity: Literal["critical", "warning", "suggestion"] = Field(..., description="Issue severity.")
    category: str = Field(..., description="Issue category, e.g., 'security' or 'quoting'.")
    description: str = Field(..., description="What the issue is.")
    fix: str = Field(..., description="How to fix it.")


class ShellScriptEvaluationResponse(BaseModel):
    """Response model containing the shell script review."""

    is_functional: bool = Field(..., description="Whether the script accomplishes the task.")
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall score from 0 to 100.")
    correctness_score: float = Field(..., ge=0.0, le=100.0, description="Functional correctness score.")
    robustness_score: float = Field(..., ge=0.0, le=100.0, description="Error handling and edge case score.")
    security_score: float = Field(..., ge=0.0, le=100.0, description="Security practices score.")
    readability_score: float = Field(..., ge=0.0, le=100.0, description="Clarity and documentation score.")
    issues: List[ScriptIssue] = Field(default_factory=list, description="Issues found.")
    checklist: Dict[str, bool] = Field(default_factory=dict, description="Best practices checklist.")
    improved_script: str = Field(..., description="A fully improved version of the script.")
    key_improvements: List[str] = Field(default_factory=list, description="Most important improvements made.")
    security_warnings: List[str] = Field(default_factory=list, description="Security concerns.")


class CommandExplanationRequest(BaseModel):
    """Request payload for explaining a command."""

    command: str = Field(..., description="The shell command or pipeline to explain.")
    environment: str = Field(..., description="Shell environment, e.g., 'bash' or 'powershell'.")
    explanation_depth: ExplanationDepth = Field(..., description="Depth of the explanation.")


class ComponentExplanation(BaseModel):
    """Explanation of one component of a command."""

    component: str = Field(..., description="The piece of the command, e.g., 'grep' or '-r'.")
    type: Literal["command", "flag", "argument", "operator", "redirect", "variable"] = Field(..., description="Kind of component.")
    explanation: str = Field(..., description="What the component does.")
    man_reference: Optional[str] = Field(None, description="Relevant man page section, if applicable.")


class RelatedCommand(BaseModel):
    """A command related to the one being explained."""

    command: str = Field(..., description="The related command.")
    relationship: str = Field(..., description="How it relates, e.g., 'alternative' or 'complement'.")
    when_to_use: str = Field(..., description="When to use it instead.")


class CommandExplanationResponse(BaseModel):
    """Response model containing the command explanation."""

    plain_english_summary: str = Field(..., description="One-sentence summary in plain English.")
    component_breakdown: List[ComponentExplanation] = Field(default_factory=list, description="Breakdown of each component.")
    data_flow: str = Field(..., description="How data flows through the command.")
    expected_output_description: str = Field(..., description="What output the command produces.")
    side_effects: List[str] = Field(default_factory=list, description="Side effects of running the command.")
    potential_dangers: List[str] = Field(default_factory=list, description="Risks to be careful about.")
    related_commands: List[RelatedCommand] = Field(default_factory=list, description="Related commands.")
    common_variations: List[str] = Field(default_factory=list, description="Common ways this command is used.")
    visual_diagram: Optional[str] = Field(None, description="ASCII diagram of the operation, if helpful.")


class ErrorDiagnosisRequest(BaseModel):
    """Request payload for diagnosing a command error."""

    user_command: str = Field(..., description="The command the user tried to run.")
    error_output: str = Field(..., description="The full error message or stderr output.")
    environment: str = Field(..., description="Shell environment and OS.")
    user_intent: Optional[str] = Field(None, description="What the user was trying to accomplish.")
    surrounding_context: Optional[str] = Field(None, description="Current directory, file state, and similar context.")


class RelatedError(BaseModel):
    """A similar error the user might encounter."""

    error_pattern: str = Field(..., description="What the error looks like.")
    cause: str = Field(..., description="What causes it.")
    fix: str = Field(..., description="How to resolve it.")


class ErrorDiagnosisResponse(BaseModel):
    """Response model containing the error diagnosis."""

    diagnosis: str = Field(..., description="What went wrong and why.")
    root_cause: Literal[
        "syntax_error", "permission_denied", "file_not_found", "command_not_found",
        "quoting_issue", "path_issue", "environment_issue", "argument_error",
        "network_error", "resource_limit", "logic_error", "other",
    ] = Field(..., description="Category of the root cause.")
    confidence: Literal["certain", "likely", "possible"] = Field(..., description="How confident the diagnosis is.")
    corrected_command: str = Field(..., description="The fixed command.")
    alternative_fixes: List[str] = Field(default_factory=list, description="Other ways to fix the issue.")
    explanation_for_learning: str = Field(..., description="Educational explanation to avoid the mistake later.")
    prevention_tips: List[str] = Field(default_factory=list, description="Tips to prevent similar errors.")
    related_errors: List[RelatedError] = Field(default_factory=list, description="Similar errors.")
    severity: Literal["trivial", "minor", "moderate", "serious"] = Field(..., description="How serious the error is.")


class CommandOptimizationRequest(BaseModel):
    """Request payload for suggesting better commands."""

    user_command: str = Field(..., description="The user's working command or pipeline.")
    task_goal: str = Field(..., description="What the command is trying to accomplish.")
    environment: str = Field(..., description="Shell environment.")
    optimization_priority: Optional[OptimizationPriority] = Field(None, description="What to optimize for primarily.")
    data_scale: Optional[str] = Field(None, description="Scale of the data, e.g., '50GB log file'.")


class CommandAlternative(BaseModel):
    """An alternative approach to the same task."""

    command: str = Field(..., description="The alternative command.")
    approach: str = Field(..., description="Name of the approach, e.g., 'awk-only'.")
    pros: List[str] = Field(default_factory=list, description="Advantages.")
    cons: List[str] = Field(default_factory=list, description="Disadvantages.")
    best_for: str = Field(..., description="When this approach is best.")
    speed_rating: Literal["fastest", "fast", "moderate", "slow"] = Field(..., description="Expected speed.")


class OptimizationChange(BaseModel):
    """A specific change made to the original command."""

    change: str = Field(..., description="What was changed.")
    why_better: str = Field(..., description="Why this is an improvement.")
    impact: Literal["high", "medium", "low"] = Field(..., description="Expected impact on performance.")


class CommandOptimizationResponse(BaseModel):
    """Response model containing optimization suggestions."""

    optimized_command: str = Field(..., description="The most optimized version of the command.")
    alternatives: List[CommandAlternative] = Field(default_factory=list, description="Alternative approaches.")
    performance_comparison: Dict[str, str] = Field(default_factory=dict, description="Original versus optimized comparison.")
    what_changed: List[OptimizationChange] = Field(default_factory=list, description="Specific optimizations made.")
    anti_patterns_identified: List[str] = Field(default_factory=list, description="Anti-patterns in the original command.")
    pro_tips: List[str] = Field(default_factory=list, description="Tips for similar tasks.")
    tool_recommendation: Optional[str] = Field(None, description="A different tool that would be better, if any.")
