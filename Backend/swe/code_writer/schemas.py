from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field

Difficulty = Literal["easy", "medium", "hard"]


class ProblemGenerationRequest(BaseModel):
    """Request payload for generating a coding problem."""

    topic: str = Field(..., description="The coding topic, e.g., 'Binary Search'.")
    difficulty: Difficulty = Field(..., description="Difficulty level of the problem.")
    language: str = Field(..., description="Programming language for starter code.")
    constraints: Optional[str] = Field(None, description="Optional extra constraints.")


class ProblemExample(BaseModel):
    """A sample test case shown with the problem statement."""

    input: str = Field(..., description="Sample input.")
    output: str = Field(..., description="Expected output.")
    explanation: str = Field(..., description="Brief explanation of the sample.")


class ProblemGenerationResponse(BaseModel):
    """Response model containing a generated coding problem."""

    problem_title: str = Field(..., description="A short, catchy title for the problem.")
    description: str = Field(..., description="Full problem description including objective and requirements.")
    examples: List[ProblemExample] = Field(default_factory=list, description="Example test cases.")
    constraints_list: List[str] = Field(default_factory=list, description="List of constraints.")
    starter_code: str = Field(..., description="Starter code template in the requested language.")
    expected_time_complexity: str = Field(..., description="Expected time complexity.")
    expected_space_complexity: str = Field(..., description="Expected space complexity.")


class TestCaseGenerationRequest(BaseModel):
    """Request payload for generating visible and hidden test cases."""

    problem_statement: str = Field(..., description="The full problem statement including description and constraints.")
    difficulty: Difficulty = Field(..., description="Difficulty level of the problem.")
    language: str = Field(..., description="Programming language for formatting test inputs and outputs.")
    num_visible_cases: int = Field(..., ge=0, description="Number of visible test cases to show the user.")
    num_hidden_cases: int = Field(..., ge=0, description="Number of hidden test cases for final evaluation.")


class TestCase(BaseModel):
    """A single generated test case."""

    id: str = Field(..., description="Unique identifier, e.g., 'tc_1'.")
    input: Any = Field(..., description="The input value(s) for the test case.")
    expected_output: Any = Field(..., description="The correct output for the test case.")
    is_hidden: bool = Field(..., description="True for hidden test cases, False for visible ones.")
    is_edge_case: bool = Field(..., description="True if this test case covers an edge case.")
    category: Literal["normal", "edge", "stress", "boundary"] = Field(..., description="Test case category.")
    description: str = Field(..., description="Brief note on what this test case checks.")


class TestCaseGenerationResponse(BaseModel):
    """Response model containing the generated test cases."""

    test_cases: List[TestCase] = Field(default_factory=list, description="Generated test cases.")


class TestResult(BaseModel):
    """The outcome of running a single test case in the code sandbox."""

    test_id: str = Field(..., description="Identifier of the test case.")
    passed: bool = Field(..., description="Whether the test case passed.")
    input: Any = Field(None, description="The test input.")
    expected_output: Any = Field(None, description="The expected result.")
    actual_output: Any = Field(None, description="The output produced by the user's code.")
    error: Optional[str] = Field(None, description="Error message if the run failed.")


class CodeEvaluationRequest(BaseModel):
    """Request payload for judging a submission against test results."""

    problem_statement: str = Field(..., description="The full problem statement.")
    user_code: str = Field(..., description="The code submitted by the user.")
    language: str = Field(..., description="Programming language of the submission.")
    test_results: List[TestResult] = Field(..., description="Results from the code sandbox.")


class FailedCase(BaseModel):
    """Summary of a failed test case."""

    test_id: str = Field(..., description="Identifier of the failed test case.")
    input: str = Field(..., description="The test input.")
    expected: str = Field(..., description="The expected output.")
    actual: str = Field(..., description="The output produced by the user's code.")
    reason_for_failure: str = Field(..., description="Why the test case failed.")


class CodeEvaluationResponse(BaseModel):
    """Response model containing the verdict for a submission."""

    is_correct: bool = Field(..., description="True only if all test cases passed.")
    score: float = Field(..., ge=0.0, le=100.0, description="Score from 0.0 to 100.0 based on pass ratio.")
    total_tests: int = Field(..., ge=0, description="Total number of test cases run.")
    passed_tests: int = Field(..., ge=0, description="Number of test cases passed.")
    failed_tests: int = Field(..., ge=0, description="Number of test cases failed.")
    failed_cases_summary: List[FailedCase] = Field(default_factory=list, description="Details of each failed test case.")
    feedback: str = Field(..., description="Constructive feedback on what went wrong and how to fix it.")
    verdict: Literal["Accepted", "Wrong Answer", "Runtime Error", "Partial"] = Field(..., description="Final verdict.")


class CodeQualityRequest(BaseModel):
    """Request payload for a code quality review."""

    user_code: str = Field(..., description="The user's submitted code.")
    language: str = Field(..., description="Programming language of the code.")
    rubric: Optional[str] = Field(None, description="Optional custom rubric or checklist.")


class CodeIssue(BaseModel):
    """A single issue found during a code quality review."""

    line: str = Field(..., description="Line number or range, e.g., '12-15'.")
    severity: Literal["critical", "warning", "suggestion"] = Field(..., description="Issue severity.")
    category: str = Field(..., description="Issue category, e.g., 'naming' or 'complexity'.")
    description: str = Field(..., description="What the issue is.")


class CodeQualityResponse(BaseModel):
    """Response model containing the code quality review."""

    overall_rating: Literal["Excellent", "Good", "Average", "Poor"] = Field(..., description="Overall code quality rating.")
    style_score: float = Field(..., ge=0.0, le=10.0, description="Score for code style and formatting.")
    readability_score: float = Field(..., ge=0.0, le=10.0, description="Score for readability and clarity.")
    maintainability_score: float = Field(..., ge=0.0, le=10.0, description="Score for maintainability and structure.")
    issues: List[CodeIssue] = Field(default_factory=list, description="Specific issues found.")
    suggestions: List[str] = Field(default_factory=list, description="Actionable suggestions for improvement.")
    strengths: List[str] = Field(default_factory=list, description="Positive aspects of the code.")
    complexity_rating: Literal["Simple", "Moderate", "Complex", "Overly Complex"] = Field(
        ..., description="How complex the code is relative to the task."
    )


class HintRequest(BaseModel):
    """Request payload for a progressive hint."""

    problem_statement: str = Field(..., description="The problem the user is trying to solve.")
    user_code: Optional[str] = Field(None, description="The user's current attempt, if any.")
    hint_level: Literal[1, 2, 3] = Field(..., description="1 = conceptual nudge, 2 = directional hint, 3 = strong hint.")


class HintResponse(BaseModel):
    """Response model containing a hint for a stuck user."""

    hint_text: str = Field(..., description="The hint itself.")
    hint_type: Literal["conceptual", "algorithmic", "structural", "edge_case"] = Field(..., description="Kind of hint.")
    guiding_question: str = Field(..., description="A Socratic question to guide the user.")
    next_level_teaser: str = Field(..., description="A one-line teaser of what a stronger hint would reveal.")


class SolutionExplanationRequest(BaseModel):
    """Request payload for explaining the optimal solution."""

    problem_statement: str = Field(..., description="The original problem statement.")
    user_code: str = Field(..., description="The code the user submitted.")
    optimal_solution: str = Field(..., description="The optimal reference solution code.")
    language: str = Field(..., description="Programming language used.")


class SolutionExplanationResponse(BaseModel):
    """Response model containing the solution walkthrough and comparison."""

    explanation: str = Field(..., description="Step-by-step walkthrough of the optimal solution.")
    user_approach_summary: str = Field(..., description="Brief summary of the user's approach.")
    comparison: str = Field(..., description="How the user's approach compares to the optimal one.")
    time_complexity: str = Field(..., description="Time complexity of the optimal solution.")
    space_complexity: str = Field(..., description="Space complexity of the optimal solution.")
    user_time_complexity: str = Field(..., description="Time complexity of the user's solution.")
    user_space_complexity: str = Field(..., description="Space complexity of the user's solution.")
    key_concepts: List[str] = Field(default_factory=list, description="Core CS concepts demonstrated.")
    common_mistakes: List[str] = Field(default_factory=list, description="Common mistakes learners make.")
    learning_resources: List[str] = Field(default_factory=list, description="Topics to study to master this pattern.")
