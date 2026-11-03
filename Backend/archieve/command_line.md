# 🖥️ Command Line Proficiency Section — DSPy Modules (Complete Code)

Here's the full implementation for all modules in the **Command Line / Terminal Proficiency Section**. This section tests the user's ability to think in the terminal, chain commands, write shell scripts, and debug CLI issues.

---

## 📦 Common Imports

```python
import dspy
from typing import List, Dict, Optional, Literal, Any
```

---

## 🧩 Module 1: `CommandChallengeGenerator`

Generates CLI challenges based on topic, difficulty, and environment.

```python
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


# Usage
challenge_gen = dspy.Predict(CommandChallengeGenerator)
result = challenge_gen(
    topic="text processing",
    difficulty="intermediate",
    environment="linux",
    scenario_context="You're analyzing web server logs to find suspicious activity."
)
print(result.challenge_title)
print(result.task_description)
print(f"Expected command: {result.expected_command}")
```

---

## 🧩 Module 2: `CommandEvaluator`

Evaluates the user's submitted command against the challenge requirements.

```python
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


# Usage
evaluator = dspy.Predict(CommandEvaluator)
result = evaluator(
    challenge={
        "task_description": "Find all .log files larger than 10MB",
        "initial_filesystem": {"current_directory": "/var/log", "tree": {"app.log": "15MB", "error.log": "5MB"}},
        "expected_output": "/var/log/app.log",
        "evaluation_criteria": ["Uses find", "Filters by size", "Filters by extension"],
        "expected_command": "find . -name '*.log' -size +10M",
        "acceptable_alternatives": ["find /var/log -type f -name '*.log' -size +10M"]
    },
    user_command="find /var/log -type f -name '*.log' -size +10M",
    simulated_output="/var/log/app.log",
    environment="linux"
)
print(f"Verdict: {result.verdict}, Score: {result.score}")
```

---

## 🧩 Module 3: `CommandHintGenerator`

Provides progressive hints for CLI challenges.

```python
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


# Usage
hint_gen = dspy.Predict(CommandHintGenerator)
result = hint_gen(
    challenge={
        "task_description": "Count the number of unique IP addresses in access.log",
        "initial_filesystem": {},
        "expected_output": "42",
        "evaluation_criteria": ["Uses standard tools", "Handles duplicates"],
        "expected_command": "awk '{print $1}' access.log | sort -u | wc -l",
        "acceptable_alternatives": ["cut -d' ' -f1 access.log | sort | uniq | wc -l"]
    },
    user_attempt="grep access.log",
    user_error="grep: access.log: No such file or directory",
    hint_level=1
)
print(f"Hint: {result.hint_text}")
print(f"Consider: {result.suggested_commands}")
```

---

## 🧩 Module 4: `PipelineDesigner`

Evaluates and explains multi-command pipelines.

```python
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


# Usage
designer = dspy.Predict(PipelineDesigner)
result = designer(
    user_pipeline="cat access.log | grep 'ERROR' | awk '{print $4}' | sort | uniq -c | sort -rn | head -5",
    task_goal="Find the top 5 most frequent IP addresses that caused errors",
    environment="bash",
    input_data_sample="2024-01-15 10:30:45 ERROR 192.168.1.1 timeout"
)
print(result.data_flow_diagram)
print(f"Improved: {result.improved_pipeline}")
```

---

## 🧩 Module 5: `ShellScriptEvaluator`

Evaluates shell scripts written by the user.

```python
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


# Usage
script_eval = dspy.Predict(ShellScriptEvaluator)
result = script_eval(
    user_script="""#!/bin/bash
for file in $1/*; do
    size=$(stat -c %s $file)
    if [ $size -gt 1000000 ]; then
        echo $file is large
        rm $file
    fi
done""",
    task_requirement="Find and delete files larger than 1MB in a given directory",
    environment="bash"
)
print(f"Score: {result.overall_score}/100")
print(f"Security score: {result.security_score}/100")
for issue in result.issues:
    print(f"  [{issue['severity']}] Line {issue['line']}: {issue['description']}")
```

---

## 🧩 Module 6: `CommandExplainer`

Explains what a command does — useful for learning and verification.

```python
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


# Usage
explainer = dspy.Predict(CommandExplainer)
result = explainer(
    command="find /var/log -type f -name '*.log' -mtime +7 -exec gzip {} \\;",
    environment="bash",
    explanation_depth="intermediate"
)
print(result.plain_english_summary)
for comp in result.component_breakdown:
    print(f"  {comp['component']}: {comp['explanation']}")
```

---

## 🧩 Module 7: `ErrorDiagnoser`

Diagnoses command errors and suggests fixes.

```python
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


# Usage
diagnoser = dspy.Predict(ErrorDiagnoser)
result = diagnoser(
    user_command="cat /var/log/app.log | grep ERROR | awk '{print $3}",
    error_output="bash: unexpected EOF while looking for matching `''\nbash: syntax error: unexpected end of file",
    environment="bash",
    user_intent="Extract the third field from ERROR lines in the log"
)
print(f"Diagnosis: {result.diagnosis}")
print(f"Fix: {result.corrected_command}")
print(f"Learn: {result.explanation_for_learning}")
```

---

## 🧩 Module 8: `CommandOptimizer`

Suggests more efficient or idiomatic alternatives to the user's command.

```python
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


# Usage
optimizer = dspy.Predict(CommandOptimizer)
result = optimizer(
    user_command="cat access.log | grep '200' | awk '{print $1}' | sort | uniq -c | sort -rn | head -10",
    task_goal="Find top 10 IPs with 200 status codes",
    environment="bash",
    optimization_priority="speed",
    data_scale="50GB log file"
)
print(f"Optimized: {result.optimized_command}")
print(f"Speedup: {result.performance_comparison['speedup_factor']}")
print(f"Anti-patterns: {result.anti_patterns_identified}")
```

---

## 🧠 Bonus: Full CLI Challenge Pipeline

```python
def full_cli_challenge_pipeline(topic, difficulty, environment, user_command, user_script=None):
    """End-to-end pipeline for a CLI challenge session."""
    
    # Step 1: Generate the challenge
    challenge = dspy.Predict(CommandChallengeGenerator)(
        topic=topic,
        difficulty=difficulty,
        environment=environment
    )
    
    # Step 2: Evaluate the user's command
    evaluation = dspy.Predict(CommandEvaluator)(
        challenge={
            "task_description": challenge.task_description,
            "initial_filesystem": challenge.initial_filesystem,
            "expected_output": challenge.expected_output,
            "evaluation_criteria": challenge.evaluation_criteria,
            "expected_command": challenge.expected_command,
            "acceptable_alternatives": challenge.acceptable_alternatives,
        },
        user_command=user_command,
        environment=environment
    )
    
    # Step 3: If incorrect, provide hints
    hints = None
    if not evaluation.is_correct:
        hints = dspy.Predict(CommandHintGenerator)(
            challenge={
                "task_description": challenge.task_description,
                "expected_command": challenge.expected_command,
                "acceptable_alternatives": challenge.acceptable_alternatives,
            },
            user_attempt=user_command,
            hint_level=1
        )
    
    # Step 4: Explain the command (for learning)
    explanation = dspy.Predict(CommandExplainer)(
        command=user_command,
        environment=environment,
        explanation_depth="intermediate"
    )
    
    # Step 5: If the command works, suggest optimizations
    optimization = None
    if evaluation.is_correct:
        optimization = dspy.Predict(CommandOptimizer)(
            user_command=user_command,
            task_goal=challenge.task_description,
            environment=environment
        )
    
    # Step 6: If a script was submitted, evaluate it separately
    script_eval = None
    if user_script:
        script_eval = dspy.Predict(ShellScriptEvaluator)(
            user_script=user_script,
            task_requirement=challenge.task_description,
            environment=environment
        )
    
    return {
        "challenge": challenge,
        "evaluation": evaluation,
        "hints": hints,
        "explanation": explanation,
        "optimization": optimization,
        "script_evaluation": script_eval,
    }


# Usage Example
if __name__ == "__main__":
    results = full_cli_challenge_pipeline(
        topic="file search and text processing",
        difficulty="intermediate",
        environment="linux",
        user_command="find /var/log -name '*.log' -exec grep -l 'ERROR' {} \\; | xargs wc -l | sort -n"
    )
    
    print(f"Challenge: {results['challenge'].challenge_title}")
    print(f"Verdict: {results['evaluation'].verdict}")
    print(f"Score: {results['evaluation'].score}/100")
    
    if results['hints']:
        print(f"Hint: {results['hints'].hint_text}")
    
    if results['optimization']:
        print(f"Optimized: {results['optimization'].optimized_command}")
```

---

## ✅ Summary Table

| Module | Core Purpose | Key Output |
|---|---|---|
| `CommandChallengeGenerator` | Create CLI challenges | `challenge_title`, `task_description`, `initial_filesystem`, `expected_command` |
| `CommandEvaluator` | Judge user's command | `verdict`, `score`, `command_breakdown`, `feedback` |
| `CommandHintGenerator` | Progressive CLI hints | `hint_text`, `suggested_commands`, `key_flags` |
| `PipelineDesigner` | Analyze multi-command pipelines | `pipeline_stages`, `data_flow_diagram`, `improved_pipeline` |
| `ShellScriptEvaluator` | Review shell scripts | `overall_score`, `checklist`, `improved_script`, `security_warnings` |
| `CommandExplainer` | Explain what commands do | `plain_english_summary`, `component_breakdown`, `related_commands` |
| `ErrorDiagnoser` | Diagnose command errors | `diagnosis`, `root_cause`, `corrected_command`, `prevention_tips` |
| `CommandOptimizer` | Suggest better commands | `optimized_command`, `alternatives`, `performance_comparison`, `anti_patterns_identified` |

---

## 🗺️ Where This Fits in the Portal

```
[ COMPLETE CSE PORTAL ]
 1. Code Writing          ← Original
 2. Code Debugging        ← Original
 3. System Design         ← Added
 4. Code Review           ← Added
 5. Testing & TDD         ← Added
 6. DB & API Design       ← Added
 7. Security              ← Added
 8. Communication         ← Added
 9. COMMAND LINE ⭐       ← NEW (this section)
10. [Future: Git, CI/CD, Cloud, etc.]
```

---

## 🚀 Next Steps

Would you like me to:
1. **Write modules for another section** (System Design, Code Review, Testing, DB/API, Security, or Communication)?
2. **Add a Git & Version Control section** (another critical skill for CSE engineers)?
3. **Build a unified config/executor** that handles all modules across all sections?
4. **Add `dspy.ChainOfThought`** wrappers for complex evaluators?

Let me know which direction to take!