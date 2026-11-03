# 🛡️ Security & Vulnerability Management Section — DSPy Modules (Complete Code)

Here's the full implementation for all 3 modules in the **Security & Vulnerability Management Section**. These modules work together to create a complete security training loop: **inject vulnerabilities → user finds them → user fixes them → system validates**.

---

## 📦 Common Imports

```python
import dspy
from typing import List, Dict, Optional, Literal, Any
```

---

## 🧩 Module 1: `VulnerabilityInjector`

Takes clean, working code and injects realistic security vulnerabilities for the user to discover. This is the **challenge creator**.

```python
class VulnerabilityInjector(dspy.Signature):
    """You are a cybersecurity expert and ethical hacker who creates realistic 
    security training exercises. Your task is to take clean, working code and 
    inject subtle but realistic security vulnerabilities into it.
    
    Rules:
    - The injected code must still RUN without syntax errors.
    - Vulnerabilities should be subtle enough to be challenging but detectable 
      by a trained engineer.
    - Do NOT inject multiple vulnerabilities on the same line.
    - Preserve the original functionality — the code should still "work" 
      from a user's perspective, even though it's insecure.
    - Match the coding style of the original so the injection is not obvious."""

    clean_code: str = dspy.InputField(description="The original, secure, working code.")
    language: str = dspy.InputField(description="Programming language of the code.")
    vuln_types: List[str] = dspy.InputField(description="""
        Types of vulnerabilities to inject. Examples:
        'SQL Injection', 'XSS', 'Command Injection', 'Path Traversal',
        'Hardcoded Secrets', 'Insecure Deserialization', 'SSRF',
        'Broken Authentication', 'IDOR', 'CSRF'
    """)
    num_vulns: int = dspy.InputField(description="Number of vulnerabilities to inject.")
    difficulty: Literal["beginner", "intermediate", "advanced"] = dspy.InputField(
        description="How subtle the vulnerabilities should be."
    )

    vulnerable_code: str = dspy.OutputField(description="The code with injected vulnerabilities (must still run).")
    injected_vulns: List[Dict[str, Any]] = dspy.OutputField(description="""
        Hidden reference list of injected vulnerabilities. Each dict has:
        - 'id': unique identifier (e.g., 'vuln_1')
        - 'type': vulnerability category (e.g., 'SQL Injection')
        - 'cwe_id': CWE identifier if applicable (e.g., 'CWE-89')
        - 'line_numbers': list of affected line numbers
        - 'severity': 'critical', 'high', 'medium', 'low'
        - 'description': what was changed and why it's vulnerable
        - 'detection_hint': a subtle clue for the user
    """)
    scenario_context: str = dspy.OutputField(
        description="A brief real-world scenario describing where this code might be deployed."
    )
    challenge_brief: str = dspy.OutputField(
        description="A short briefing for the user explaining the exercise (without revealing the vulns)."
    )


# Usage
injector = dspy.Predict(VulnerabilityInjector)
result = injector(
    clean_code="""
def get_user(username, password):
    db = connect_db()
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    return db.execute(query, (username, hash_password(password)))
""",
    language="python",
    vuln_types=["SQL Injection", "Hardcoded Secrets"],
    num_vulns=2,
    difficulty="intermediate"
)
print(result.challenge_brief)
print(f"Injected {len(result.injected_vulns)} vulnerabilities")
```

---

## 🧩 Module 2: `SecurityScanner`

Analyzes user-submitted code to identify security vulnerabilities. This is the **evaluator/judge** — it can be used both to validate the user's findings and to scan their own code submissions.

```python
class SecurityScanner(dspy.Signature):
    """You are an expert security auditor and static analysis tool.
    Analyze the given code for security vulnerabilities using industry-standard 
    frameworks. Be thorough, precise, and prioritize by severity.
    
    Guidelines:
    - Only report REAL vulnerabilities, not stylistic preferences.
    - Each finding must include a concrete proof-of-concept or attack scenario.
    - Reference CWE (Common Weakness Enumeration) IDs where applicable.
    - Consider the language-specific security ecosystem (e.g., Python's pickle, 
      Java's deserialization, JS's eval).
    - Do NOT report false positives — accuracy is more important than recall."""

    user_code: str = dspy.InputField(description="The code to scan for vulnerabilities.")
    language: str = dspy.InputField(description="Programming language of the code.")
    security_framework: Literal["OWASP Top 10", "CWE Top 25", "SANS 25", "Custom"] = dspy.InputField(
        description="Security framework to align findings with."
    )
    context: Optional[str] = dspy.InputField(
        default=None,
        description="Optional deployment context (e.g., 'web backend', 'CLI tool', 'mobile app')."
    )

    overall_security_score: float = dspy.OutputField(
        description="Security score from 0.0 (critically insecure) to 100.0 (fully secure)."
    )
    risk_rating: Literal["Critical", "High", "Medium", "Low", "Secure"] = dspy.OutputField(
        description="Overall risk rating of the code."
    )
    vulnerabilities: List[Dict[str, Any]] = dspy.OutputField(description="""
        List of identified vulnerabilities. Each dict has:
        - 'id': unique identifier
        - 'type': vulnerability category
        - 'cwe_id': CWE identifier (e.g., 'CWE-89')
        - 'severity': 'critical', 'high', 'medium', 'low', 'info'
        - 'confidence': 'high', 'medium', 'low' — how sure we are this is real
        - 'line_numbers': list of affected line numbers
        - 'code_snippet': the vulnerable code excerpt
        - 'description': what's wrong
        - 'attack_scenario': how an attacker could exploit this
        - 'remediation': specific fix with code example
    """)
    summary: str = dspy.OutputField(
        description="Executive summary of the security posture."
    )
    positive_findings: List[str] = dspy.OutputField(
        description="Security best practices already followed in the code."
    )
    priority_fixes: List[str] = dspy.OutputField(
        description="Ordered list of what to fix first and why."
    )


# Usage
scanner = dspy.Predict(SecurityScanner)
result = scanner(
    user_code="""
@app.route('/user')
def get_user():
    user_id = request.args.get('id')
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query).fetchone()
""",
    language="python",
    security_framework="OWASP Top 10",
    context="Flask web backend handling user requests"
)
print(f"Security Score: {result.overall_security_score}/100")
print(f"Risk Rating: {result.risk_rating}")
for vuln in result.vulnerabilities:
    print(f"[{vuln['severity'].upper()}] {vuln['type']} at line {vuln['line_numbers']}")
```

---

## 🧩 Module 3: `SecureCodingFixer`

Evaluates the user's attempt to fix a reported vulnerability. This is the **validator** — it checks if the fix is actually secure, introduces new issues, or follows best practices.

```python
class SecureCodingFixer(dspy.Signature):
    """You are a senior security engineer reviewing a junior developer's attempt 
    to fix a security vulnerability. Your job is to validate whether the fix 
    actually resolves the issue, doesn't introduce new vulnerabilities, and 
    follows secure coding best practices.
    
    Be strict but educational — the goal is to teach secure coding patterns, 
    not just pass/fail. If the fix is partial, explain what's still missing."""

    vulnerable_code: str = dspy.InputField(description="The original vulnerable code.")
    user_fixed_code: str = dspy.InputField(description="The user's attempt at fixing the vulnerability.")
    vulnerability_type: str = dspy.InputField(
        description="The type of vulnerability that was reported (e.g., 'SQL Injection')."
    )
    vulnerability_description: str = dspy.InputField(
        description="Detailed description of the original vulnerability."
    )
    language: str = dspy.InputField(description="Programming language of the code.")

    is_actually_fixed: bool = dspy.OutputField(
        description="True only if the vulnerability is completely resolved."
    )
    fix_completeness: Literal["Complete", "Partial", "Ineffective", "Made Worse"] = dspy.OutputField(
        description="How complete the fix is."
    )
    fix_score: float = dspy.OutputField(
        description="Score from 0.0 to 100.0 for the quality of the fix."
    )
    new_vulns_introduced: List[Dict[str, str]] = dspy.OutputField(description="""
        Any NEW vulnerabilities introduced by the fix. Each dict has:
        - 'type': new vulnerability type
        - 'line_numbers': affected lines
        - 'description': what's wrong
        - 'severity': 'critical', 'high', 'medium', 'low'
    """)
    remaining_issues: List[str] = dspy.OutputField(
        description="Parts of the original vulnerability that are still not fixed."
    )
    best_practice_solution: str = dspy.OutputField(
        description="The ideal, production-grade fix following industry best practices."
    )
    explanation: str = dspy.OutputField(
        description="Educational explanation of why the user's fix works/doesn't work."
    )
    secure_coding_pattern: str = dspy.OutputField(
        description="The secure coding pattern that should be used (e.g., 'Parameterized Queries')."
    )
    learning_resources: List[str] = dspy.OutputField(
        description="Recommended topics/docs to study for mastering this fix."
    )


# Usage
fixer = dspy.Predict(SecureCodingFixer)
result = fixer(
    vulnerable_code="query = f\"SELECT * FROM users WHERE id = {user_id}\"",
    user_fixed_code="query = \"SELECT * FROM users WHERE id = \" + escape(user_id)",
    vulnerability_type="SQL Injection",
    vulnerability_description="User input is directly interpolated into SQL query string.",
    language="python"
)
print(f"Fix Complete? {result.is_actually_fixed}")
print(f"Score: {result.fix_score}/100")
print(f"Best Practice:\n{result.best_practice_solution}")
```

---

## 🔄 Bonus: Full Security Training Pipeline

Here's how the three modules chain together into a complete training exercise:

```python
def run_security_training_exercise(clean_code, language, vuln_types, user_fix_code=None):
    """End-to-end security training pipeline:
    1. Inject vulnerabilities into clean code
    2. Scan the vulnerable code (validates the injection worked)
    3. If user submitted a fix, evaluate it
    """
    
    # Step 1: Create the challenge by injecting vulnerabilities
    challenge = dspy.Predict(VulnerabilityInjector)(
        clean_code=clean_code,
        language=language,
        vuln_types=vuln_types,
        num_vulns=len(vuln_types),
        difficulty="intermediate"
    )
    
    print("=" * 60)
    print("🎯 SECURITY CHALLENGE")
    print("=" * 60)
    print(challenge.challenge_brief)
    print(f"\nScenario: {challenge.scenario_context}")
    print(f"\nVulnerable Code:\n{challenge.vulnerable_code}")
    
    # Step 2: Scan the vulnerable code (system-side validation)
    scan = dspy.Predict(SecurityScanner)(
        user_code=challenge.vulnerable_code,
        language=language,
        security_framework="OWASP Top 10",
        context=challenge.scenario_context
    )
    
    print("\n" + "=" * 60)
    print("🔍 SYSTEM SCAN RESULTS (for reference)")
    print("=" * 60)
    print(f"Security Score: {scan.overall_security_score}/100")
    print(f"Vulnerabilities Found: {len(scan.vulnerabilities)}")
    for vuln in scan.vulnerabilities:
        print(f"  - [{vuln['severity'].upper()}] {vuln['type']}")
    
    # Step 3: If user submitted a fix, evaluate it
    fix_evaluation = None
    if user_fix_code:
        # Match user's fix against the first vulnerability for simplicity
        target_vuln = challenge.injected_vulns[0]
        
        fix_evaluation = dspy.Predict(SecureCodingFixer)(
            vulnerable_code=challenge.vulnerable_code,
            user_fixed_code=user_fix_code,
            vulnerability_type=target_vuln['type'],
            vulnerability_description=target_vuln['description'],
            language=language
        )
        
        print("\n" + "=" * 60)
        print("✅ FIX EVALUATION")
        print("=" * 60)
        print(f"Fix Complete? {fix_evaluation.is_actually_fixed}")
        print(f"Completeness: {fix_evaluation.fix_completeness}")
        print(f"Score: {fix_evaluation.fix_score}/100")
        print(f"\nFeedback:\n{fix_evaluation.explanation}")
        print(f"\nBest Practice Solution:\n{fix_evaluation.best_practice_solution}")
    
    return {
        "challenge": challenge,
        "scan": scan,
        "fix_evaluation": fix_evaluation,
    }


# Example Usage
if __name__ == "__main__":
    clean_code = """
def login_user(username, password):
    query = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'"
    result = db.execute(query)
    if result:
        session['user'] = username
        return True
    return False
"""
    
    user_fix = """
def login_user(username, password):
    # Escape inputs to prevent SQL injection
    safe_user = username.replace("'", "''")
    safe_pass = password.replace("'", "''")
    query = f"SELECT * FROM users WHERE username='{safe_user}' AND password='{safe_pass}'"
    result = db.execute(query)
    if result:
        session['user'] = username
        return True
    return False
"""
    
    run_security_training_exercise(
        clean_code=clean_code,
        language="python",
        vuln_types=["SQL Injection", "Hardcoded Secrets"],
        user_fix_code=user_fix
    )
```

---

## ✅ Summary Table

| Module | Role | Key Output |
|---|---|---|
| `VulnerabilityInjector` | 🎯 Challenge Creator | `vulnerable_code`, `injected_vulns[]`, `challenge_brief` |
| `SecurityScanner` | 🔍 Evaluator / Auditor | `vulnerabilities[]`, `overall_security_score`, `priority_fixes[]` |
| `SecureCodingFixer` | ✅ Fix Validator | `is_actually_fixed`, `fix_score`, `best_practice_solution` |

---

## 🎯 How These Modules Work Together

```
   ┌──────────────────────┐
   │   Clean, Safe Code   │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ VulnerabilityInjector│  ← Creates the challenge
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │  Vulnerable Code +   │  ← User receives this to analyze
   │  Challenge Brief     │
   └──────────┬───────────┘
              │
    ┌─────────┴──────────┐
    ▼                    ▼
┌──────────────┐   ┌──────────────┐
│ User Finds   │   │User Submits  │
│ Vulnerabilities│ │    a Fix     │
└──────┬───────┘   └──────┬───────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│SecurityScanner│   │SecureCoding  │
│(validates    │   │  Fixer       │
│ user's finds)│   │(validates fix)│
└──────────────┘   └──────────────┘
```

---

## 🚀 Next Steps

Would you like me to:

1. **Write the Code Editor / Debugging Section** modules next?
2. **Write the System Design & Architecture Section** modules?
3. **Create a unified executor** (similar to your `execute_flexible_writer`) that handles all security modules with a single config?
4. **Add `dspy.ChainOfThought`** wrappers for deeper reasoning in the `SecurityScanner`?

Let me know which direction to take! 🛡️