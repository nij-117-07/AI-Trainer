import logging
from typing import Any, List, Literal, Optional, Type, TypeVar

import dspy
from pydantic import BaseModel

from core.dspy_utils import build_lm, run_predictor
from swe.code_writer.schemas import (
    CodeEvaluationRequest,
    CodeEvaluationResponse,
    CodeQualityRequest,
    CodeQualityResponse,
    HintRequest,
    HintResponse,
    ProblemGenerationRequest,
    ProblemGenerationResponse,
    SolutionExplanationRequest,
    SolutionExplanationResponse,
    TestCaseGenerationRequest,
    TestCaseGenerationResponse,
)

logger = logging.getLogger(__name__)

ResponseT = TypeVar("ResponseT", bound=BaseModel)


class CodeWriterError(Exception):
    """Base exception for all code writer module failures."""


class GenerationError(CodeWriterError):
    """Raised when the underlying DSPy pipeline fails to produce a result."""


class ProblemStatementGenerator(dspy.Signature):
    """You are an expert CSE educator who designs coding problems.
    Given a topic, difficulty level, and programming language, generate a
    well-structured coding problem with clear description, examples, constraints,
    and starter code. Problems should be original, unambiguous, and progressively challenging."""

    topic: str = dspy.InputField(description="The coding topic, e.g., 'Binary Search', 'Dynamic Programming', 'Linked Lists'.")
    difficulty: Literal["easy", "medium", "hard"] = dspy.InputField(description="Difficulty level of the problem.")
    language: str = dspy.InputField(description="Programming language for starter code (e.g., 'python', 'java', 'cpp').")
    constraints: Optional[str] = dspy.InputField(
        default=None,
        description="Optional extra constraints, e.g., 'must use recursion', 'O(n) time only'."
    )

    problem_title: str = dspy.OutputField(description="A short, catchy title for the problem.")
    description: str = dspy.OutputField(description="Full problem description including objective and requirements.")
    examples: List[dict] = dspy.OutputField(description="""
        List of example test cases. Each dict has:
        - 'input': sample input
        - 'output': expected output
        - 'explanation': brief explanation
    """)
    constraints_list: List[str] = dspy.OutputField(description="List of constraints (e.g., '1 <= n <= 10^5').")
    starter_code: str = dspy.OutputField(description="Starter code template in the specified language.")
    expected_time_complexity: str = dspy.OutputField(description="Expected time complexity, e.g., 'O(n log n)'.")
    expected_space_complexity: str = dspy.OutputField(description="Expected space complexity, e.g., 'O(1)'.")


class TestCaseGenerator(dspy.Signature):
    """You are a meticulous QA engineer for a coding platform.
    Given a coding problem, generate a comprehensive set of test cases including
    normal cases, edge cases, and stress cases. Clearly mark which are hidden
    (used for final evaluation) vs visible (shown to user during solving)."""

    problem_statement: str = dspy.InputField(description="The full problem statement including description and constraints.")
    difficulty: Literal["easy", "medium", "hard"] = dspy.InputField(description="Difficulty level — harder problems need more edge cases.")
    language: str = dspy.InputField(description="Programming language for formatting test inputs/outputs.")
    num_visible_cases: int = dspy.InputField(description="Number of visible test cases to show the user (typically 2-3).")
    num_hidden_cases: int = dspy.InputField(description="Number of hidden test cases for final evaluation (typically 5-10).")

    test_cases: List[dict[str, Any]] = dspy.OutputField(description="""
        Combined list of test cases. Each dict must have:
        - 'id': unique identifier (e.g., 'tc_1')
        - 'input': the input value(s) — use dict for multiple params
        - 'expected_output': the correct output
        - 'is_hidden': boolean — True for hidden, False for visible
        - 'is_edge_case': boolean — True if this tests an edge case
        - 'category': one of 'normal', 'edge', 'stress', 'boundary'
        - 'description': brief note on what this case tests
    """)


class CodeEvaluator(dspy.Signature):
    """You are a fair and thorough code judge for a competitive programming platform.
    Given the problem statement, the user's submitted code, and the results of
    running test cases, determine correctness and provide actionable feedback.
    Be objective — base correctness ONLY on test results, not assumptions."""

    problem_statement: str = dspy.InputField(description="The full problem statement.")
    user_code: str = dspy.InputField(description="The code submitted by the user.")
    language: str = dspy.InputField(description="Programming language of the submission.")
    test_results: List[dict[str, Any]] = dspy.InputField(description="""
        Results from the code sandbox. Each dict has:
        - 'test_id': identifier
        - 'passed': boolean
        - 'input': the test input
        - 'expected_output': expected result
        - 'actual_output': what user's code produced
        - 'error': error message if any (else null)
    """)

    is_correct: bool = dspy.OutputField(description="True only if ALL test cases passed.")
    score: float = dspy.OutputField(description="Score from 0.0 to 100.0 based on test pass ratio.")
    total_tests: int = dspy.OutputField(description="Total number of test cases run.")
    passed_tests: int = dspy.OutputField(description="Number of test cases passed.")
    failed_tests: int = dspy.OutputField(description="Number of test cases failed.")
    failed_cases_summary: List[dict] = dspy.OutputField(description="""
        For each failed test: {'test_id', 'input', 'expected', 'actual', 'reason_for_failure'}.
        Keep empty if all passed.
    """)
    feedback: str = dspy.OutputField(description="Constructive, specific feedback explaining what went wrong and how to fix it.")
    verdict: Literal["Accepted", "Wrong Answer", "Runtime Error", "Partial"] = dspy.OutputField(
        description="Final verdict for the submission."
    )


class CodeQualityAnalyzer(dspy.Signature):
    """You are a senior engineer conducting a code quality review.
    Analyze the user's code for style, readability, maintainability, and
    adherence to language-specific best practices. Be constructive and specific.
    Focus on what can be improved, not just what's wrong."""

    user_code: str = dspy.InputField(description="The user's submitted code.")
    language: str = dspy.InputField(description="Programming language (e.g., 'python', 'java', 'cpp').")
    rubric: Optional[str] = dspy.InputField(
        default=None,
        description="Optional custom rubric or checklist to evaluate against."
    )

    overall_rating: Literal["Excellent", "Good", "Average", "Poor"] = dspy.OutputField(
        description="Overall code quality rating."
    )
    style_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for code style and formatting.")
    readability_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for readability and clarity.")
    maintainability_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for maintainability and structure.")
    issues: List[dict] = dspy.OutputField(description="""
        List of specific issues found. Each dict has:
        - 'line': line number or range (e.g., '12-15')
        - 'severity': 'critical', 'warning', or 'suggestion'
        - 'category': e.g., 'naming', 'complexity', 'duplication', 'documentation'
        - 'description': what the issue is
    """)
    suggestions: List[str] = dspy.OutputField(description="Actionable suggestions for improvement.")
    strengths: List[str] = dspy.OutputField(description="Positive aspects of the code to reinforce good habits.")
    complexity_rating: Literal["Simple", "Moderate", "Complex", "Overly Complex"] = dspy.OutputField(
        description="How complex the code is relative to the task."
    )


class HintGenerator(dspy.Signature):
    """You are a patient and pedagogical coding mentor.
    The user is stuck on a problem. Provide a hint at the requested level
    of specificity. NEVER give away the full solution.
    - Level 1: High-level conceptual nudge (which algorithm/data structure to think about)
    - Level 2: Medium specificity (point toward the approach without details)
    - Level 3: Strong hint (nearly reveal the approach, but still let them code it)
    Always encourage and motivate the user."""

    problem_statement: str = dspy.InputField(description="The problem the user is trying to solve.")
    user_code: Optional[str] = dspy.InputField(
        default=None,
        description="The user's current attempt (may be empty if they haven't started)."
    )
    hint_level: Literal[1, 2, 3] = dspy.InputField(description="""
        Hint specificity level:
        1 = gentle conceptual nudge
        2 = directional hint toward approach
        3 = strong hint, almost revealing the solution path
    """)

    hint_text: str = dspy.OutputField(description="The hint itself — clear, concise, and at the right specificity level.")
    hint_type: Literal["conceptual", "algorithmic", "structural", "edge_case"] = dspy.OutputField(
        description="What kind of hint this is."
    )
    guiding_question: str = dspy.OutputField(
        description="A Socratic question to help the user think in the right direction."
    )
    next_level_teaser: str = dspy.OutputField(
        description="A one-line teaser of what a stronger hint would reveal (motivates them to try first)."
    )


class SolutionExplainer(dspy.Signature):
    """You are an expert CSE tutor explaining the optimal solution to a coding problem.
    Compare the user's approach to the optimal one, explain the optimal approach
    step-by-step, and highlight key CS concepts. Make the explanation educational
    and accessible — the goal is learning, not showing off."""

    problem_statement: str = dspy.InputField(description="The original problem statement.")
    user_code: str = dspy.InputField(description="The code the user submitted.")
    optimal_solution: str = dspy.InputField(description="The optimal/reference solution code.")
    language: str = dspy.InputField(description="Programming language used.")

    explanation: str = dspy.OutputField(description="Step-by-step walkthrough of the optimal solution's logic.")
    user_approach_summary: str = dspy.OutputField(description="Brief summary of what approach the user took.")
    comparison: str = dspy.OutputField(description="How the user's approach compares to the optimal one — similarities and differences.")
    time_complexity: str = dspy.OutputField(description="Time complexity of the optimal solution with justification.")
    space_complexity: str = dspy.OutputField(description="Space complexity of the optimal solution with justification.")
    user_time_complexity: str = dspy.OutputField(description="Time complexity of the user's solution.")
    user_space_complexity: str = dspy.OutputField(description="Space complexity of the user's solution.")
    key_concepts: List[str] = dspy.OutputField(description="Core CS concepts demonstrated (e.g., 'Sliding Window', 'Memoization').")
    common_mistakes: List[str] = dspy.OutputField(description="Common mistakes learners make on this problem.")
    learning_resources: List[str] = dspy.OutputField(description="Suggested topics to study to master this pattern.")


class CodeWriterService:
    """Business layer wrapping the DSPy code writing pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.2)

    async def generate_problem(self, data: ProblemGenerationRequest) -> ProblemGenerationResponse:
        """
        Generates a complete coding problem for a topic and difficulty.

        Args:
            data: The validated problem generation request.

        Returns:
            ProblemGenerationResponse: The generated problem.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce the problem.
        """
        return self._predict(
            ProblemStatementGenerator,
            ProblemGenerationResponse,
            topic=data.topic,
            difficulty=data.difficulty,
            language=data.language,
            constraints=data.constraints,
        )

    async def generate_test_cases(self, data: TestCaseGenerationRequest) -> TestCaseGenerationResponse:
        """
        Generates visible and hidden test cases for a problem.

        Args:
            data: The validated test case generation request.

        Returns:
            TestCaseGenerationResponse: The generated test cases.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce the test cases.
        """
        return self._predict(
            TestCaseGenerator,
            TestCaseGenerationResponse,
            problem_statement=data.problem_statement,
            difficulty=data.difficulty,
            language=data.language,
            num_visible_cases=data.num_visible_cases,
            num_hidden_cases=data.num_hidden_cases,
        )

    async def evaluate_submission(self, data: CodeEvaluationRequest) -> CodeEvaluationResponse:
        """
        Judges a submission against the results of its test run.

        Args:
            data: The validated code evaluation request.

        Returns:
            CodeEvaluationResponse: The verdict, score, and feedback.

        Raises:
            GenerationError: If the DSPy pipeline fails to evaluate the submission.
        """
        return self._predict(
            CodeEvaluator,
            CodeEvaluationResponse,
            problem_statement=data.problem_statement,
            user_code=data.user_code,
            language=data.language,
            test_results=[result.model_dump() for result in data.test_results],
        )

    async def analyze_quality(self, data: CodeQualityRequest) -> CodeQualityResponse:
        """
        Reviews code style, readability, and maintainability.

        Args:
            data: The validated code quality request.

        Returns:
            CodeQualityResponse: The quality ratings and issues found.

        Raises:
            GenerationError: If the DSPy pipeline fails to review the code.
        """
        return self._predict(
            CodeQualityAnalyzer,
            CodeQualityResponse,
            user_code=data.user_code,
            language=data.language,
            rubric=data.rubric,
        )

    async def generate_hint(self, data: HintRequest) -> HintResponse:
        """
        Produces a progressive hint without revealing the full solution.

        Args:
            data: The validated hint request.

        Returns:
            HintResponse: The hint and a guiding question.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce a hint.
        """
        return self._predict(
            HintGenerator,
            HintResponse,
            problem_statement=data.problem_statement,
            user_code=data.user_code,
            hint_level=data.hint_level,
        )

    async def explain_solution(self, data: SolutionExplanationRequest) -> SolutionExplanationResponse:
        """
        Explains the optimal solution and compares it with the user's approach.

        Args:
            data: The validated solution explanation request.

        Returns:
            SolutionExplanationResponse: The walkthrough and complexity comparison.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce the explanation.
        """
        return self._predict(
            SolutionExplainer,
            SolutionExplanationResponse,
            problem_statement=data.problem_statement,
            user_code=data.user_code,
            optimal_solution=data.optimal_solution,
            language=data.language,
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
