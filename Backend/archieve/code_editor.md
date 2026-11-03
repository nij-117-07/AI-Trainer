# 🐛 Code Editor / Debugging Section — DSPy Modules (Complete Code)

Here's the full implementation for all 6 modules in the **Code Editor / Debugging Section**.

---

## 📦 Common Imports

```python
import dspy
from typing import List, Dict, Optional, Literal, Any
```

---

## 🧩 Module 1: `BuggyCodeGenerator`

Takes correct code and injects realistic bugs for debugging exercises.

```python
class BuggyCodeGenerator(dspy.Signature):
    """You are a mischievous but educational code saboteur.
    Given a piece of correct, working code, inject realistic bugs that a 
    programmer might actually make. Bugs should be plausible — not obvious 
    typos, but real logical errors, off-by-one mistakes, missing edge cases, 
    or subtle semantic issues. The difficulty determines how subtle the bugs are."""

    original_code: str = dspy.InputField(description="The correct, working code to be sabotaged.")
    language: str = dspy.InputField(description="Programming language of the code.")
    num_bugs: int = dspy.InputField(description="Number of bugs to inject (typically 2-5).")
    difficulty: Literal["easy", "medium", "hard"] = dspy.InputField(description="""
        Difficulty of bugs to inject:
        - easy: obvious errors (wrong operator, missing return)
        - medium: logical errors (off-by-one, wrong condition)
        - hard: subtle semantic bugs (race conditions, edge case misses, wrong data structure choice)
    """)
    bug_types: Optional[List[str]] = dspy.InputField(
        default=None,
        description="Optional list of bug categories to focus on, e.g., ['logic', 'boundary', 'type_error', 'performance']."
    )
    context: Optional[str] = dspy.InputField(
        default=None,
        description="Optional context about what the code is supposed to do."
    )

    buggy_code: str = dspy.OutputField(description="The code with bugs injected. Must still be syntactically valid.")
    total_bugs_injected: int = dspy.OutputField(description="Exact number of bugs injected.")
    bug_details: List[Dict[str, Any]] = dspy.OutputField(description="""
        Hidden details about each injected bug. Each dict has:
        - 'bug_id': unique identifier (e.g., 'bug_1')
        - 'line_number': line where bug was introduced
        - 'bug_type': category (e.g., 'logic', 'boundary', 'syntax', 'type', 'performance')
        - 'original_line': what the line was before
        - 'buggy_line': what the line is now
        - 'description': what the bug does
        - 'severity': 'critical', 'major', or 'minor'
    """)
    exercise_description: str = dspy.OutputField(
        description="A short description framing this as a debugging exercise for the user."
    )
    expected_behavior: str = dspy.OutputField(
        description="Description of what the code SHOULD do when working correctly."
    )
    sample_failing_input: Dict[str, Any] = dspy.OutputField(
        description="An example input that would cause the buggy code to fail."
    )


# Usage
buggy_gen = dspy.Predict(BuggyCodeGenerator)
result = buggy_gen(
    original_code="""
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
""",
    language="python",
    num_bugs=3,
    difficulty="medium",
    context="Binary search implementation on a sorted array."
)
print(result.buggy_code)
print(f"Bugs injected: {result.total_bugs_injected}")
```

---

## 🧩 Module 2: `BugDetector`

Analyzes the user's edited code and identifies which bugs remain unfixed.

```python
class BugDetector(dspy.Signature):
    """You are an expert debugger and code reviewer.
    Given the original buggy code, the user's edited version, and the expected 
    behavior, analyze what bugs the user successfully fixed and what bugs 
    still remain. Be precise about line numbers and bug categories.
    Also check if the user accidentally introduced any NEW bugs while fixing."""

    original_buggy_code: str = dspy.InputField(description="The buggy code the user was given to debug.")
    user_edited_code: str = dspy.InputField(description="The user's edited/fixed version of the code.")
    expected_behavior: str = dspy.InputField(description="Description of what the code should do correctly.")
    known_bugs: List[Dict[str, Any]] = dspy.InputField(description="""
        The actual bugs that were injected (hidden from user, given to you for evaluation).
        Each dict has: 'bug_id', 'line_number', 'bug_type', 'description', 'severity'.
    """)
    language: str = dspy.InputField(description="Programming language of the code.")

    bugs_fixed: List[Dict[str, str]] = dspy.OutputField(description="""
        List of bugs the user successfully fixed. Each dict has:
        - 'bug_id': which bug was fixed
        - 'fix_description': what the user changed to fix it
        - 'fix_quality': 'correct', 'partially_correct', or 'suboptimal_but_working'
    """)
    bugs_remaining: List[Dict[str, str]] = dspy.OutputField(description="""
        List of original bugs the user failed to fix. Each dict has:
        - 'bug_id': which bug remains
        - 'description': what the bug is
        - 'hint': a subtle hint about where to look
    """)
    new_bugs_introduced: List[Dict[str, Any]] = dspy.OutputField(description="""
        Any NEW bugs the user accidentally introduced while fixing. Each dict has:
        - 'line_number': where the new bug is
        - 'description': what the new bug does
        - 'severity': 'critical', 'major', or 'minor'
        - 'likely_cause': why the user probably made this mistake
    """)
    total_bugs_fixed: int = dspy.OutputField(description="Count of original bugs fixed.")
    total_bugs_remaining: int = dspy.OutputField(description="Count of original bugs still present.")
    total_new_bugs: int = dspy.OutputField(description="Count of new bugs introduced.")
    overall_assessment: str = dspy.OutputField(description="Summary of the user's debugging performance.")


# Usage
detector = dspy.Predict(BugDetector)
result = detector(
    original_buggy_code="def foo(x): ...",
    user_edited_code="def foo(x): ...",
    expected_behavior="Should return the sum of all positive numbers.",
    known_bugs=[
        {"bug_id": "bug_1", "line_number": 3, "bug_type": "logic", "description": "Off-by-one in loop", "severity": "major"},
        {"bug_id": "bug_2", "line_number": 7, "bug_type": "boundary", "description": "Missing null check", "severity": "critical"}
    ],
    language="python"
)
print(f"Fixed: {result.total_bugs_fixed}, Remaining: {result.total_bugs_remaining}")
```

---

## 🧩 Module 3: `EditAnalyzer`

Compares original buggy code vs user's edited code to understand the changes.

```python
class EditAnalyzer(dspy.Signature):
    """You are a code diff analyst.
    Compare the original code with the user's edited version. Identify every 
    change made, understand the intent behind each change, and determine 
    whether each change was an improvement, neutral, or a regression.
    This helps provide granular feedback on the user's debugging thought process."""

    original_code: str = dspy.InputField(description="The original buggy code.")
    edited_code: str = dspy.InputField(description="The user's edited version.")
    language: str = dspy.InputField(description="Programming language.")
    expected_behavior: Optional[str] = dspy.InputField(
        default=None,
        description="Optional description of what the code should do."
    )

    diff_summary: str = dspy.OutputField(description="High-level summary of all changes made.")
    total_lines_changed: int = dspy.OutputField(description="Total number of lines modified, added, or removed.")
    changes: List[Dict[str, Any]] = dspy.OutputField(description="""
        Detailed list of each change. Each dict has:
        - 'change_id': unique identifier
        - 'change_type': 'modified', 'added', or 'removed'
        - 'line_range': affected lines (e.g., '5-7')
        - 'original_snippet': the original code snippet
        - 'new_snippet': the new code snippet
        - 'intent': what the user was trying to achieve with this change
        - 'assessment': 'improvement', 'neutral', 'regression', or 'unnecessary'
        - 'reasoning': why you made this assessment
    """)
    debugging_strategy: Literal["systematic", "targeted", "scattered", "trial_and_error"] = dspy.OutputField(
        description="The user's apparent debugging approach based on their edit pattern."
    )
    edit_efficiency: Literal["highly_efficient", "efficient", "moderate", "inefficient"] = dspy.OutputField(
        description="How efficiently the user made changes (minimal edits for maximum fix)."
    )
    positive_patterns: List[str] = dspy.OutputField(description="Good debugging habits observed.")
    areas_for_improvement: List[str] = dspy.OutputField(description="Where the user's editing approach could improve.")


# Usage
analyzer = dspy.Predict(EditAnalyzer)
result = analyzer(
    original_code="for i in range(len(arr)):\n    if arr[i] > max:\n        max = arr[i]",
    edited_code="max_val = arr[0]\nfor i in range(len(arr)):\n    if arr[i] > max_val:\n        max_val = arr[i]",
    language="python",
    expected_behavior="Find the maximum value in an array."
)
print(result.diff_summary)
print(f"Strategy: {result.debugging_strategy}")
```

---

## 🧩 Module 4: `DebugHintGenerator`

Provides progressive debugging hints without giving away the answer.

```python
class DebugHintGenerator(dspy.Signature):
    """You are a supportive debugging mentor.
    The user is trying to fix buggy code but is stuck. Provide hints at the 
    requested level of specificity WITHOUT revealing the exact bug or fix.
    - Level 1: Point to the general area (which function/section to look at)
    - Level 2: Suggest a debugging technique or what to trace
    - Level 3: Almost reveal the bug, but still let the user figure out the fix
    Use Socratic questioning to guide their thinking."""

    buggy_code: str = dspy.InputField(description="The buggy code the user is working on.")
    user_current_attempt: Optional[str] = dspy.InputField(
        default=None,
        description="The user's current attempt at fixing the code (may be same as buggy_code if no changes yet)."
    )
    expected_behavior: str = dspy.InputField(description="What the code should do correctly.")
    error_message: Optional[str] = dspy.InputField(
        default=None,
        description="Any error message or failing test output the user is seeing."
    )
    hint_level: Literal[1, 2, 3] = dspy.InputField(description="""
        Hint specificity level:
        1 = general area / what to investigate
        2 = debugging technique / what to trace
        3 = near-reveal of the specific bug
    """)
    hints_already_given: Optional[List[str]] = dspy.InputField(
        default=None,
        description="Previous hints already given to avoid repetition."
    )

    hint_text: str = dspy.OutputField(description="The hint — clear, progressive, and not giving away the answer.")
    hint_focus_area: str = dspy.OutputField(description="Which part of the code the hint focuses on (e.g., 'loop boundaries', 'base case', 'variable initialization').")
    suggested_debugging_technique: str = dspy.OutputField(description="""
        A specific technique the user should try, e.g.:
        - 'Add a print statement at line X'
        - 'Trace the value of variable Y through the loop'
        - 'Try running with input [specific case]'
        - 'Check what happens when the input is empty'
    """)
    guiding_question: str = dspy.OutputField(description="A Socratic question to direct the user's thinking.")
    confidence_builder: str = dspy.OutputField(description="An encouraging note to keep the user motivated.")


# Usage
hint_gen = dspy.Predict(DebugHintGenerator)
result = hint_gen(
    buggy_code="def find_duplicates(arr):\n    result = []\n    for i in range(len(arr)):\n        if arr[i] in arr:\n            result.append(arr[i])\n    return result",
    user_current_attempt=None,
    expected_behavior="Return a list of elements that appear more than once.",
    error_message="find_duplicates([1,2,3]) returns [1,2,3] instead of []",
    hint_level=1
)
print(f"Hint: {result.hint_text}")
print(f"Try: {result.suggested_debugging_technique}")
print(f"Ask yourself: {result.guiding_question}")
```

---

## 🧩 Module 5: `CodeRewriter`

Suggests a cleaner, optimized rewrite of the user's edited code.

```python
class CodeRewriter(dspy.Signature):
    """You are a senior software engineer doing a code refactor.
    Given the user's edited (and hopefully working) code, suggest a cleaner, 
    more optimized, or more idiomatic rewrite. Preserve correctness — the 
    rewritten code MUST produce the same output. Explain every change you make 
    and why it's an improvement. Focus on readability, performance, and 
    language idioms."""

    user_edited_code: str = dspy.InputField(description="The user's current version of the code (after debugging).")
    language: str = dspy.InputField(description="Programming language.")
    optimization_goal: Optional[Literal["readability", "performance", "maintainability", "idiomatic", "all"]] = dspy.InputField(
        default="all",
        description="Primary goal for the rewrite."
    )
    expected_behavior: Optional[str] = dspy.InputField(
        default=None,
        description="What the code should do, to ensure correctness is preserved."
    )

    rewritten_code: str = dspy.OutputField(description="The fully rewritten, improved version of the code.")
    changes_made: List[Dict[str, str]] = dspy.OutputField(description="""
        List of specific changes. Each dict has:
        - 'change_id': identifier
        - 'category': 'naming', 'structure', 'algorithm', 'idiom', 'performance', 'error_handling'
        - 'description': what was changed
        - 'reason': why this is an improvement
    """)
    complexity_before: Dict[str, str] = dspy.OutputField(description="Time and space complexity of the user's code: {'time': ..., 'space': ...}.")
    complexity_after: Dict[str, str] = dspy.OutputField(description="Time and space complexity of the rewritten code: {'time': ..., 'space': ...}.")
    improvement_summary: str = dspy.OutputField(description="High-level summary of how the rewrite improves the code.")
    tradeoffs: Optional[List[str]] = dspy.OutputField(description="Any tradeoffs made in the rewrite (e.g., 'uses more memory for speed').")
    key_takeaway: str = dspy.OutputField(description="The one lesson the user should remember from this refactor.")


# Usage
rewriter = dspy.Predict(CodeRewriter)
result = rewriter(
    user_edited_code="""
def get_even(nums):
    result = []
    for i in range(len(nums)):
        if nums[i] % 2 == 0:
            result.append(nums[i])
    return result
""",
    language="python",
    optimization_goal="idiomatic",
    expected_behavior="Return a list of even numbers from the input list."
)
print(result.rewritten_code)
print(f"Key takeaway: {result.key_takeaway}")
```

---

## 🧩 Module 6: `DebugScoreEvaluator`

Scores the user's overall debugging performance.

```python
class DebugScoreEvaluator(dspy.Signature):
    """You are a fair debugging performance evaluator.
    Given the original buggy code, the user's final fixed code, the expected 
    behavior, and metadata about the session, produce a comprehensive score 
    and detailed feedback. Consider correctness of fix, efficiency of approach, 
    bugs introduced, and time taken."""

    original_buggy_code: str = dspy.InputField(description="The buggy code the user started with.")
    user_fixed_code: str = dspy.InputField(description="The user's final fixed version.")
    expected_behavior: str = dspy.InputField(description="What the code should do correctly.")
    total_original_bugs: int = dspy.InputField(description="Total number of bugs that were in the original code.")
    bugs_fixed_by_user: int = dspy.InputField(description="Number of original bugs the user successfully fixed.")
    new_bugs_introduced: int = dspy.InputField(description="Number of new bugs the user introduced while fixing.")
    time_taken_seconds: int = dspy.InputField(description="Time the user took to complete the debugging (in seconds).")
    hints_used: int = dspy.InputField(description="Number of hints the user requested.")
    num_attempts: int = dspy.InputField(description="Number of submission attempts the user made.")

    overall_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for the debugging session.")
    correctness_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for correctness of the final code.")
    efficiency_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for how efficiently the user debugged.")
    code_quality_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for quality of the final code.")
    grade: Literal["S", "A", "B", "C", "D", "F"] = dspy.OutputField(description="Letter grade for the session.")
    bugs_fixed_count: int = dspy.OutputField(description="Confirmed count of bugs fixed.")
    bugs_remaining_count: int = dspy.OutputField(description="Confirmed count of bugs still remaining.")
    bugs_introduced_count: int = dspy.OutputField(description="Confirmed count of new bugs introduced.")
    performance_breakdown: Dict[str, str] = dspy.OutputField(description="""
        Breakdown of scoring:
        - 'correctness_weight': percentage weight given to correctness
        - 'efficiency_weight': percentage weight given to efficiency
        - 'quality_weight': percentage weight given to code quality
    """)
    strengths: List[str] = dspy.OutputField(description="What the user did well during debugging.")
    weaknesses: List[str] = dspy.OutputField(description="Areas where the user struggled.")
    detailed_feedback: str = dspy.OutputField(description="Comprehensive feedback paragraph for the user.")
    recommended_practice: List[str] = dspy.OutputField(description="Specific skills or patterns the user should practice.")
    difficulty_adjustment: Literal["easier", "same", "harder"] = dspy.OutputField(
        description="Suggested difficulty for the next debugging exercise."
    )


# Usage
scorer = dspy.Predict(DebugScoreEvaluator)
result = scorer(
    original_buggy_code="def foo(arr): ...",
    user_fixed_code="def foo(arr): ...",
    expected_behavior="Should sort the array in ascending order.",
    total_original_bugs=3,
    bugs_fixed_by_user=2,
    new_bugs_introduced=1,
    time_taken_seconds=420,
    hints_used=2,
    num_attempts=4
)
print(f"Score: {result.overall_score}/100 — Grade: {result.grade}")
print(f"Feedback: {result.detailed_feedback}")
```

---


## ✅ Summary Table

| Module | Core Purpose | Key Output |
|---|---|---|
| `BuggyCodeGenerator` | Create debugging exercises | `buggy_code`, `bug_details[]`, `expected_behavior` |
| `BugDetector` | Identify fixed vs remaining bugs | `bugs_fixed[]`, `bugs_remaining[]`, `new_bugs_introduced[]` |
| `EditAnalyzer` | Understand user's edit pattern | `changes[]`, `debugging_strategy`, `edit_efficiency` |
| `DebugHintGenerator` | Progressive debugging hints | `hint_text`, `suggested_debugging_technique`, `guiding_question` |
| `CodeRewriter` | Suggest cleaner rewrite | `rewritten_code`, `changes_made[]`, `key_takeaway` |
| `DebugScoreEvaluator` | Score debugging performance | `overall_score`, `grade`, `detailed_feedback` |

---

