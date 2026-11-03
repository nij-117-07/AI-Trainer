# 💻 Code Writing Section — DSPy Modules (Complete Code)

Here's the full implementation for all 6 modules in the **Code Writing Section**. Each module includes the DSPy Signature class and a usage example.

---

## 📦 Common Imports (place at top of file)

```python
import dspy
from typing import List, Dict, Optional, Literal, Any
```

---

## 🧩 Module 1: `ProblemStatementGenerator`

Generates a complete coding problem based on topic, difficulty, and language.

```python
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
    examples: List[Dict[str, str]] = dspy.OutputField(description="""
        List of example test cases. Each dict has:
        - 'input': sample input
        - 'output': expected output
        - 'explanation': brief explanation
    """)
    constraints_list: List[str] = dspy.OutputField(description="List of constraints (e.g., '1 <= n <= 10^5').")
    starter_code: str = dspy.OutputField(description="Starter code template in the specified language.")
    expected_time_complexity: str = dspy.OutputField(description="Expected time complexity, e.g., 'O(n log n)'.")
    expected_space_complexity: str = dspy.OutputField(description="Expected space complexity, e.g., 'O(1)'.")


# Usage
problem_gen = dspy.Predict(ProblemStatementGenerator)
result = problem_gen(
    topic="Two Pointers",
    difficulty="medium",
    language="python",
    constraints="Must solve in O(n) time and O(1) space."
)
print(result.problem_title)
print(result.description)
```

---

## 🧩 Module 2: `TestCaseGenerator`

Generates hidden and visible test cases for a given problem.

```python
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

    test_cases: List[Dict[str, Any]] = dspy.OutputField(description="""
        Combined list of test cases. Each dict must have:
        - 'id': unique identifier (e.g., 'tc_1')
        - 'input': the input value(s) — use dict for multiple params
        - 'expected_output': the correct output
        - 'is_hidden': boolean — True for hidden, False for visible
        - 'is_edge_case': boolean — True if this tests an edge case
        - 'category': one of 'normal', 'edge', 'stress', 'boundary'
        - 'description': brief note on what this case tests
    """)


# Usage
tc_gen = dspy.Predict(TestCaseGenerator)
result = tc_gen(
    problem_statement="Find the maximum sum subarray of size k...",
    difficulty="medium",
    language="python",
    num_visible_cases=2,
    num_hidden_cases=6
)
for tc in result.test_cases:
    print(tc)
```

---

## 🧩 Module 3: `CodeEvaluator`

The core judge — evaluates user's code against test results and the problem statement.

```python
class CodeEvaluator(dspy.Signature):
    """You are a fair and thorough code judge for a competitive programming platform.
    Given the problem statement, the user's submitted code, and the results of 
    running test cases, determine correctness and provide actionable feedback.
    Be objective — base correctness ONLY on test results, not assumptions."""

    problem_statement: str = dspy.InputField(description="The full problem statement.")
    user_code: str = dspy.InputField(description="The code submitted by the user.")
    language: str = dspy.InputField(description="Programming language of the submission.")
    test_results: List[Dict[str, Any]] = dspy.InputField(description="""
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
    failed_cases_summary: List[Dict[str, str]] = dspy.OutputField(description="""
        For each failed test: {'test_id', 'input', 'expected', 'actual', 'reason_for_failure'}.
        Keep empty if all passed.
    """)
    feedback: str = dspy.OutputField(description="Constructive, specific feedback explaining what went wrong and how to fix it.")
    verdict: Literal["Accepted", "Wrong Answer", "Runtime Error", "Partial"] = dspy.OutputField(
        description="Final verdict for the submission."
    )


# Usage
evaluator = dspy.Predict(CodeEvaluator)
result = evaluator(
    problem_statement="...",
    user_code="def solve(arr): ...",
    language="python",
    test_results=[
        {"test_id": "tc_1", "passed": True, "input": [1,2,3], "expected_output": 6, "actual_output": 6, "error": None},
        {"test_id": "tc_2", "passed": False, "input": [], "expected_output": 0, "actual_output": None, "error": "IndexError"}
    ]
)
print(result.verdict, result.score)
```

---

## 🧩 Module 4: `CodeQualityAnalyzer`

Evaluates code style, readability, and best practices (independent of correctness).

```python
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
    issues: List[Dict[str, str]] = dspy.OutputField(description="""
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


# Usage
analyzer = dspy.Predict(CodeQualityAnalyzer)
result = analyzer(
    user_code="def f(x):\n  return x*2 if x>0 else 0",
    language="python"
)
print(result.overall_rating, result.style_score)
for issue in result.issues:
    print(issue)
```

---

## 🧩 Module 5: `HintGenerator`

Provides progressive hints when the user is stuck — without giving away the answer.

```python
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


# Usage
hint_gen = dspy.Predict(HintGenerator)
result = hint_gen(
    problem_statement="Find the longest substring without repeating characters.",
    user_code="def lengthOfLongestSubstring(s):\n    # I'm stuck here",
    hint_level=1
)
print(result.hint_text)
print(f"Think about: {result.guiding_question}")
```

---

## 🧩 Module 6: `SolutionExplainer`

After submission, explains the optimal approach and compares it to the user's solution.

```python
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


# Usage
explainer = dspy.Predict(SolutionExplainer)
result = explainer(
    problem_statement="...",
    user_code="def solve(...): ...",
    optimal_solution="def solve(...): ...",
    language="python"
)
print(result.explanation)
print(f"Key concepts: {result.key_concepts}")
```

---



## ✅ Summary Table

| Module | Core Purpose | Key Output |
|---|---|---|
| `ProblemStatementGenerator` | Create problems | `problem_title`, `description`, `starter_code` |
| `TestCaseGenerator` | Build test suites | `test_cases[]` with hidden/edge flags |
| `CodeEvaluator` | Judge correctness | `verdict`, `score`, `feedback` |
| `CodeQualityAnalyzer` | Review code style | `overall_rating`, `issues[]`, `suggestions[]` |
| `HintGenerator` | Help stuck users | `hint_text`, `guiding_question` |
| `SolutionExplainer` | Teach optimal approach | `explanation`, `key_concepts[]` |

---

