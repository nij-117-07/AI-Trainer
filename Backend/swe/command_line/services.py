import logging
from typing import Any, Dict, List, Literal, Optional, Type, TypeVar

import dspy
from pydantic import BaseModel

from core.dspy_utils import build_lm, run_predictor
from swe.command_line.schemas import (
    ChallengeGenerationRequest,
    ChallengeGenerationResponse,
    CommandEvaluationRequest,
    CommandEvaluationResponse,
    CommandExplanationRequest,
    CommandExplanationResponse,
    CommandHintRequest,
    CommandHintResponse,
    CommandOptimizationRequest,
    CommandOptimizationResponse,
    ErrorDiagnosisRequest,
    ErrorDiagnosisResponse,
    PipelineDesignRequest,
    PipelineDesignResponse,
    ShellScriptEvaluationRequest,
    ShellScriptEvaluationResponse,
)

logger = logging.getLogger(__name__)

ResponseT = TypeVar("ResponseT", bound=BaseModel)


class CommandLineError(Exception):
    """Base exception for all command line module failures."""


class GenerationError(CommandLineError):
    """Raised when the underlying DSPy pipeline fails to produce a result."""


class CommandChallengeGenerator(dspy.Signature):
    """You are an expert DevOps engineer and Linux instructor designing
    command-line challenges. Create realistic, practical CLI problems that
    test the user's terminal skills. Challenges should mirror real-world
    scenarios a developer or sysadmin would face. Include the simulated
    file system state so the user understands their starting environment."""

    topic: str = dspy.InputField(description="""
        CLI topic area. Examples: 'file manipulation', 'text processing',
        'process management', 'permissions', 'networking', 'searching',
        'pipelines', 'regex', 'archives', 'system monitoring'.
    """)
    difficulty: Literal["beginner", "intermediate", "advanced", "expert"] = dspy.InputField(
        description="Difficulty level of the challenge."
    )
    environment: Literal["linux", "macos", "windows_powershell", "windows_cmd"] = dspy.InputField(
        description="Target operating system / shell environment."
    )
    scenario_context: Optional[str] = dspy.InputField(
        default=None,
        description="Optional real-world scenario framing, e.g., 'You're a sysadmin investigating a slow server'."
    )

    challenge_title: str = dspy.OutputField(description="A short, descriptive title for the challenge.")
    scenario: str = dspy.OutputField(description="Real-world scenario description that motivates the task.")
    task_description: str = dspy.OutputField(description="Clear description of what the user must accomplish.")
    initial_filesystem: Dict[str, Any] = dspy.OutputField(description="""
        Simulated starting file system state. Dict with:
        - 'current_directory': where the user starts
        - 'tree': nested dict representing files/folders
        - 'file_contents': dict mapping file paths to their contents (for relevant files)
        - 'permissions': dict mapping paths to permission strings
    """)
    expected_command: str = dspy.OutputField(description="One ideal command or pipeline that solves the challenge.")
    acceptable_alternatives: List[str] = dspy.OutputField(description="Other valid commands/pipelines that also solve it.")
    expected_output: str = dspy.OutputField(description="The exact expected terminal output.")
    evaluation_criteria: List[str] = dspy.OutputField(description="List of criteria that must be met for a correct answer.")
    key_commands_tested: List[str] = dspy.OutputField(description="List of commands/concepts this challenge tests.")
    learning_objective: str = dspy.OutputField(description="What the user should learn from this challenge.")


class CommandEvaluator(dspy.Signature):
    """You are a strict but fair command-line evaluator.
    Given a CLI challenge, the user's submitted command, and the simulated
    output it would produce, determine if the command correctly solves the
    problem. Consider correctness, efficiency, and whether it meets all
    evaluation criteria. Accept multiple valid approaches."""

    challenge: Dict[str, Any] = dspy.InputField(description="""
        The full challenge details including:
        - 'task_description': what needs to be done
        - 'initial_filesystem': the starting environment
        - 'expected_output': what correct output looks like
        - 'evaluation_criteria': list of criteria to check
        - 'expected_command': the reference solution
        - 'acceptable_alternatives': other valid solutions
    """)
    user_command: str = dspy.InputField(description="The command or pipeline the user submitted.")
    simulated_output: Optional[str] = dspy.InputField(
        default=None,
        description="The output the user's command would produce (if available from sandbox)."
    )
    environment: str = dspy.InputField(description="The shell environment (linux, macos, powershell, etc.).")

    is_correct: bool = dspy.OutputField(description="True if the command correctly solves the challenge.")
    score: float = dspy.OutputField(description="Score from 0.0 to 100.0.")
    verdict: Literal["Perfect", "Correct", "Partially Correct", "Incorrect", "Dangerous"] = dspy.OutputField(description="""
        Verdict:
        - Perfect: optimal and clean solution
        - Correct: works but could be better
        - Partially Correct: solves part of the problem
        - Incorrect: doesn't solve the problem
        - Dangerous: command could cause harm (e.g., rm -rf /)
    """)
    output_matches: bool = dspy.OutputField(description="Whether the simulated output matches expected output.")
    criteria_met: List[Dict[str, Any]] = dspy.OutputField(description="""
        Evaluation of each criterion. Each dict has:
        - 'criterion': the criterion text
        - 'met': boolean
        - 'explanation': why it was or wasn't met
    """)
    command_breakdown: List[Dict[str, str]] = dspy.OutputField(description="""
        Step-by-step breakdown of what each part of the user's command does.
        Each dict has: 'component', 'purpose', 'correctness'.
    """)
    efficiency_rating: Literal["optimal", "good", "acceptable", "inefficient"] = dspy.OutputField(
        description="How efficient the command is compared to the ideal solution."
    )
    feedback: str = dspy.OutputField(description="Constructive feedback explaining the evaluation.")
    warnings: List[str] = dspy.OutputField(description="Any warnings about the command (portability issues, deprecated flags, etc.).")


class CommandHintGenerator(dspy.Signature):
    """You are a patient terminal mentor helping a user learn command-line skills.
    The user is stuck on a CLI challenge. Provide hints at the requested level
    WITHOUT giving away the full command.
    - Level 1: Suggest which command category to think about
    - Level 2: Name the specific command(s) and key flags to consider
    - Level 3: Provide the command structure with blanks to fill in
    Never give the complete answer unless at max level and explicitly asked."""

    challenge: Dict[str, Any] = dspy.InputField(description="The full challenge details.")
    user_attempt: Optional[str] = dspy.InputField(
        default=None,
        description="The user's current attempt (may be empty or incorrect)."
    )
    user_error: Optional[str] = dspy.InputField(
        default=None,
        description="Any error message the user is seeing."
    )
    hint_level: Literal[1, 2, 3] = dspy.InputField(description="""
        Hint specificity:
        1 = which tool/category to use
        2 = specific command and flags
        3 = command structure with blanks
    """)
    hints_already_given: Optional[List[str]] = dspy.InputField(
        default=None,
        description="Previous hints given to avoid repetition."
    )

    hint_text: str = dspy.OutputField(description="The hint content at the appropriate level.")
    command_category: str = dspy.OutputField(description="The category of command needed (e.g., 'file search', 'text processing', 'network').")
    suggested_commands: List[str] = dspy.OutputField(description="Commands the user should consider (more specific at higher levels).")
    key_flags: List[Dict[str, str]] = dspy.OutputField(description="""
        Important flags/options to consider. Each dict has:
        - 'flag': the flag (e.g., '-r', '--verbose')
        - 'purpose': what it does
        - 'why_relevant': why it matters for this challenge
    """)
    common_mistakes: List[str] = dspy.OutputField(description="Common mistakes users make on this type of challenge.")
    man_page_tip: str = dspy.OutputField(description="A tip that would appear in the relevant man page or --help output.")
    guiding_question: str = dspy.OutputField(description="A Socratic question to guide the user's thinking.")


class PipelineDesigner(dspy.Signature):
    """You are a shell pipeline expert.
    Analyze a user's multi-command pipeline (using pipes, redirects,
    subshells, etc.). Break down each stage, verify data flows correctly
    between commands, and suggest improvements. Consider edge cases like
    quoting, escaping, and error handling."""

    user_pipeline: str = dspy.InputField(description="The user's full pipeline command (may include |, >, >>, &&, ||, ;, $(), etc.).")
    task_goal: str = dspy.InputField(description="What the pipeline is supposed to accomplish.")
    environment: str = dspy.InputField(description="Shell environment (bash, zsh, powershell, etc.).")
    input_data_sample: Optional[str] = dspy.InputField(
        default=None,
        description="Sample input data the pipeline would process."
    )

    pipeline_stages: List[Dict[str, Any]] = dspy.OutputField(description="""
        Breakdown of each stage in the pipeline. Each dict has:
        - 'stage_number': order in pipeline
        - 'command': the command at this stage
        - 'input_source': where input comes from (previous stage, file, etc.)
        - 'output_format': what this stage outputs
        - 'purpose': what this stage accomplishes
        - 'correctness': 'correct', 'incorrect', or 'questionable'
    """)
    data_flow_diagram: str = dspy.OutputField(description="ASCII representation of data flow through the pipeline.")
    is_correct: bool = dspy.OutputField(description="Whether the pipeline achieves the goal.")
    issues: List[Dict[str, str]] = dspy.OutputField(description="""
        Problems found. Each dict has:
        - 'stage': which stage has the issue
        - 'issue_type': 'logic', 'syntax', 'quoting', 'portability', 'performance'
        - 'description': what the problem is
        - 'fix': how to fix it
    """)
    improved_pipeline: str = dspy.OutputField(description="An improved version of the pipeline.")
    one_liner_alternative: Optional[str] = dspy.OutputField(description="A more concise one-liner if possible.")
    scripting_recommendation: Optional[str] = dspy.OutputField(description="If the pipeline is too complex, suggest converting to a script.")
    portability_notes: List[str] = dspy.OutputField(description="Notes on whether this works across different systems.")
    key_concepts: List[str] = dspy.OutputField(description="Shell concepts demonstrated (e.g., 'piping', 'process substitution', 'here-doc').")


class ShellScriptEvaluator(dspy.Signature):
    """You are a senior DevOps engineer reviewing shell scripts.
    Evaluate the user's shell script for correctness, robustness, security,
    readability, and best practices. Check for common scripting pitfalls like
    unquoted variables, missing error handling, race conditions, and
    portability issues."""

    user_script: str = dspy.InputField(description="The shell script written by the user.")
    task_requirement: str = dspy.InputField(description="What the script is supposed to accomplish.")
    environment: str = dspy.InputField(description="Target shell (bash, zsh, sh, powershell).")
    test_inputs: Optional[List[Dict[str, str]]] = dspy.InputField(
        default=None,
        description="Optional test inputs with expected outputs."
    )

    is_functional: bool = dspy.OutputField(description="Whether the script accomplishes the task.")
    overall_score: float = dspy.OutputField(description="Score from 0.0 to 100.0.")
    correctness_score: float = dspy.OutputField(description="Score for functional correctness (0-100).")
    robustness_score: float = dspy.OutputField(description="Score for error handling and edge cases (0-100).")
    security_score: float = dspy.OutputField(description="Score for security practices (0-100).")
    readability_score: float = dspy.OutputField(description="Score for code clarity and documentation (0-100).")
    issues: List[Dict[str, Any]] = dspy.OutputField(description="""
        Issues found. Each dict has:
        - 'line': line number or range
        - 'severity': 'critical', 'warning', 'suggestion'
        - 'category': 'security', 'error_handling', 'quoting', 'portability', 'style', 'logic'
        - 'description': what the issue is
        - 'fix': how to fix it
    """)
    checklist: Dict[str, bool] = dspy.OutputField(description="""
        Best practices checklist:
        - 'has_shebang': starts with #!/bin/...
        - 'uses_set_euo': uses set -euo pipefail or similar
        - 'quotes_variables': all variables are properly quoted
        - 'has_error_handling': checks for errors appropriately
        - 'has_comments': adequately commented
        - 'uses_functions': breaks logic into functions if complex
        - 'handles_edge_cases': handles empty input, missing files, etc.
        - 'cleanup_on_exit': uses trap for cleanup if needed
    """)
    improved_script: str = dspy.OutputField(description="A fully improved version of the script.")
    key_improvements: List[str] = dspy.OutputField(description="Summary of the most important improvements made.")
    security_warnings: List[str] = dspy.OutputField(description="Any security concerns (injection risks, privilege issues, etc.).")


class CommandExplainer(dspy.Signature):
    """You are a command-line educator.
    Given any shell command or pipeline, break it down and explain every
    component in detail. This is used both as a learning tool and to verify
    that the user understands the commands they're writing. Make explanations
    clear for someone learning the terminal."""

    command: str = dspy.InputField(description="The shell command or pipeline to explain.")
    environment: str = dspy.InputField(description="Shell environment (bash, zsh, powershell, etc.).")
    explanation_depth: Literal["beginner", "intermediate", "advanced"] = dspy.InputField(description="""
        Depth of explanation:
        - beginner: explain every symbol and basic concept
        - intermediate: assume basic knowledge, focus on what's notable
        - advanced: focus on subtleties, edge cases, and performance
    """)

    plain_english_summary: str = dspy.OutputField(description="One-sentence summary of what the command does in plain English.")
    component_breakdown: List[Dict[str, str]] = dspy.OutputField(description="""
        Breakdown of each component. Each dict has:
        - 'component': the piece of the command (e.g., 'grep', '-r', '*.log')
        - 'type': 'command', 'flag', 'argument', 'operator', 'redirect', 'variable'
        - 'explanation': what it does
        - 'man_reference': relevant man page section if applicable
    """)
    data_flow: str = dspy.OutputField(description="How data flows through the command (especially for pipelines).")
    expected_output_description: str = dspy.OutputField(description="Description of what output this produces.")
    side_effects: List[str] = dspy.OutputField(description="Any side effects (file modifications, process changes, network calls).")
    potential_dangers: List[str] = dspy.OutputField(description="Potential risks or things to be careful about.")
    related_commands: List[Dict[str, str]] = dspy.OutputField(description="""
        Related commands the user might find useful. Each dict has:
        - 'command': the related command
        - 'relationship': how it relates (e.g., 'alternative', 'complement', 'prerequisite')
        - 'when_to_use': when you'd use it instead
    """)
    common_variations: List[str] = dspy.OutputField(description="Common ways this command is used in practice.")
    visual_diagram: Optional[str] = dspy.OutputField(description="ASCII diagram of the command's operation if helpful.")


class ErrorDiagnoser(dspy.Signature):
    """You are a shell error diagnostician.
    Given a command the user ran and the error output they received,
    diagnose the root cause and provide a clear fix. Consider common
    pitfalls like quoting issues, path problems, permission errors,
    and environment differences."""

    user_command: str = dspy.InputField(description="The command the user tried to run.")
    error_output: str = dspy.InputField(description="The full error message / stderr output.")
    environment: str = dspy.InputField(description="Shell environment and OS.")
    user_intent: Optional[str] = dspy.InputField(
        default=None,
        description="What the user was trying to accomplish (if known)."
    )
    surrounding_context: Optional[str] = dspy.InputField(
        default=None,
        description="Context about the environment (current directory, file state, etc.)."
    )

    diagnosis: str = dspy.OutputField(description="Clear explanation of what went wrong and why.")
    root_cause: Literal["syntax_error", "permission_denied", "file_not_found", "command_not_found",
                         "quoting_issue", "path_issue", "environment_issue", "argument_error",
                         "network_error", "resource_limit", "logic_error", "other"] = dspy.OutputField(
        description="The category of the root cause."
    )
    confidence: Literal["certain", "likely", "possible"] = dspy.OutputField(description="How confident you are in the diagnosis.")
    corrected_command: str = dspy.OutputField(description="The fixed command that should work.")
    alternative_fixes: List[str] = dspy.OutputField(description="Other ways to fix the issue.")
    explanation_for_learning: str = dspy.OutputField(description="Educational explanation to help the user avoid this mistake in the future.")
    prevention_tips: List[str] = dspy.OutputField(description="Tips to prevent similar errors in the future.")
    related_errors: List[Dict[str, str]] = dspy.OutputField(description="""
        Similar errors the user might encounter. Each dict has:
        - 'error_pattern': what the error looks like
        - 'cause': what causes it
        - 'fix': how to resolve it
    """)
    severity: Literal["trivial", "minor", "moderate", "serious"] = dspy.OutputField(description="How serious this error is.")


class CommandOptimizer(dspy.Signature):
    """You are a shell performance and idiomatic usage expert.
    Given a working command, suggest more efficient, idiomatic, or elegant
    alternatives. Consider execution speed, readability, portability, and
    resource usage. Explain WHY each alternative is better."""

    user_command: str = dspy.InputField(description="The user's working command or pipeline.")
    task_goal: str = dspy.InputField(description="What the command is trying to accomplish.")
    environment: str = dspy.InputField(description="Shell environment.")
    optimization_priority: Optional[Literal["speed", "readability", "portability", "resource_usage", "elegance"]] = dspy.InputField(
        default=None,
        description="What to optimize for primarily."
    )
    data_scale: Optional[str] = dspy.InputField(
        default=None,
        description="Scale of data being processed (e.g., '10GB log file', '1 million records')."
    )

    optimized_command: str = dspy.OutputField(description="The most optimized version of the command.")
    alternatives: List[Dict[str, Any]] = dspy.OutputField(description="""
        Multiple alternative approaches. Each dict has:
        - 'command': the alternative command
        - 'approach': name of the approach (e.g., 'awk-only', 'perl one-liner')
        - 'pros': list of advantages
        - 'cons': list of disadvantages
        - 'best_for': when this approach is best
        - 'speed_rating': 'fastest', 'fast', 'moderate', 'slow'
    """)
    performance_comparison: Dict[str, str] = dspy.OutputField(description="""
        Comparison of original vs optimized:
        - 'original_time_estimate': estimated execution time for original
        - 'optimized_time_estimate': estimated execution time for optimized
        - 'speedup_factor': how much faster (e.g., '3x', '10x')
        - 'memory_comparison': memory usage comparison
    """)
    what_changed: List[Dict[str, str]] = dspy.OutputField(description="""
        Specific optimizations made. Each dict has:
        - 'change': what was changed
        - 'why_better': why this is an improvement
        - 'impact': 'high', 'medium', or 'low' impact on performance
    """)
    anti_patterns_identified: List[str] = dspy.OutputField(description="Shell anti-patterns in the original command (e.g., Useless Use of Cat).")
    pro_tips: List[str] = dspy.OutputField(description="Pro tips for handling similar tasks efficiently in the future.")
    tool_recommendation: Optional[str] = dspy.OutputField(description="If a different tool entirely would be better (e.g., 'use jq for JSON', 'use ripgrep instead of grep -r').")


class CommandLineService:
    """Business layer wrapping the DSPy command line pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.2)

    async def generate_challenge(self, data: ChallengeGenerationRequest) -> ChallengeGenerationResponse:
        """
        Generates a CLI challenge with a simulated starting file system.

        Args:
            data: The validated challenge generation request.

        Returns:
            ChallengeGenerationResponse: The generated challenge.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce the challenge.
        """
        return self._predict(
            CommandChallengeGenerator,
            ChallengeGenerationResponse,
            topic=data.topic,
            difficulty=data.difficulty,
            environment=data.environment,
            scenario_context=data.scenario_context,
        )

    async def evaluate_command(self, data: CommandEvaluationRequest) -> CommandEvaluationResponse:
        """
        Judges a user's command against a challenge.

        Args:
            data: The validated command evaluation request.

        Returns:
            CommandEvaluationResponse: The verdict, score, and breakdown.

        Raises:
            GenerationError: If the DSPy pipeline fails to evaluate the command.
        """
        return self._predict(
            CommandEvaluator,
            CommandEvaluationResponse,
            challenge=data.challenge.model_dump(),
            user_command=data.user_command,
            simulated_output=data.simulated_output,
            environment=data.environment,
        )

    async def generate_hint(self, data: CommandHintRequest) -> CommandHintResponse:
        """
        Produces a progressive CLI hint without giving away the full command.

        Args:
            data: The validated hint request.

        Returns:
            CommandHintResponse: The hint and supporting guidance.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce a hint.
        """
        return self._predict(
            CommandHintGenerator,
            CommandHintResponse,
            challenge=data.challenge.model_dump(),
            user_attempt=data.user_attempt,
            user_error=data.user_error,
            hint_level=data.hint_level,
            hints_already_given=data.hints_already_given,
        )

    async def design_pipeline(self, data: PipelineDesignRequest) -> PipelineDesignResponse:
        """
        Breaks down a multi-command pipeline and suggests improvements.

        Args:
            data: The validated pipeline design request.

        Returns:
            PipelineDesignResponse: The stage breakdown and improved pipeline.

        Raises:
            GenerationError: If the DSPy pipeline fails to analyse the pipeline.
        """
        return self._predict(
            PipelineDesigner,
            PipelineDesignResponse,
            user_pipeline=data.user_pipeline,
            task_goal=data.task_goal,
            environment=data.environment,
            input_data_sample=data.input_data_sample,
        )

    async def evaluate_script(self, data: ShellScriptEvaluationRequest) -> ShellScriptEvaluationResponse:
        """
        Reviews a shell script for correctness, robustness, and security.

        Args:
            data: The validated shell script evaluation request.

        Returns:
            ShellScriptEvaluationResponse: The scores, issues, and improved script.

        Raises:
            GenerationError: If the DSPy pipeline fails to review the script.
        """
        return self._predict(
            ShellScriptEvaluator,
            ShellScriptEvaluationResponse,
            user_script=data.user_script,
            task_requirement=data.task_requirement,
            environment=data.environment,
            test_inputs=data.test_inputs,
        )

    async def explain_command(self, data: CommandExplanationRequest) -> CommandExplanationResponse:
        """
        Explains each component of a command or pipeline.

        Args:
            data: The validated command explanation request.

        Returns:
            CommandExplanationResponse: The breakdown and related commands.

        Raises:
            GenerationError: If the DSPy pipeline fails to explain the command.
        """
        return self._predict(
            CommandExplainer,
            CommandExplanationResponse,
            command=data.command,
            environment=data.environment,
            explanation_depth=data.explanation_depth,
        )

    async def diagnose_error(self, data: ErrorDiagnosisRequest) -> ErrorDiagnosisResponse:
        """
        Diagnoses the root cause of a command error and suggests a fix.

        Args:
            data: The validated error diagnosis request.

        Returns:
            ErrorDiagnosisResponse: The diagnosis and corrected command.

        Raises:
            GenerationError: If the DSPy pipeline fails to diagnose the error.
        """
        return self._predict(
            ErrorDiagnoser,
            ErrorDiagnosisResponse,
            user_command=data.user_command,
            error_output=data.error_output,
            environment=data.environment,
            user_intent=data.user_intent,
            surrounding_context=data.surrounding_context,
        )

    async def optimize_command(self, data: CommandOptimizationRequest) -> CommandOptimizationResponse:
        """
        Suggests more efficient or idiomatic alternatives to a working command.

        Args:
            data: The validated command optimization request.

        Returns:
            CommandOptimizationResponse: The optimized command and alternatives.

        Raises:
            GenerationError: If the DSPy pipeline fails to suggest optimizations.
        """
        return self._predict(
            CommandOptimizer,
            CommandOptimizationResponse,
            user_command=data.user_command,
            task_goal=data.task_goal,
            environment=data.environment,
            optimization_priority=data.optimization_priority,
            data_scale=data.data_scale,
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
