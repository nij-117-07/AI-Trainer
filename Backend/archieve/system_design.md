# 🏗️ System Design & Architecture Section — DSPy Modules (Complete Code)

Here's the full implementation for the **System Design & Architecture** section. System design is more qualitative than coding, so these modules focus on evaluating reasoning, tradeoffs, and architectural thinking.

---

## 📦 Common Imports

```python
import dspy
from typing import List, Dict, Optional, Literal, Any
```

---

## 🧩 Module 1: `SystemDesignPrompter`

Generates a system design problem with functional/non-functional requirements.

```python
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


# Usage
prompter = dspy.Predict(SystemDesignPrompter)
result = prompter(
    topic="Design a Rate Limiter",
    difficulty="senior",
    focus_areas=["consistency", "low_latency", "distributed_systems"]
)
print(result.problem_title)
print(f"Traffic: {result.estimated_traffic}")
```

---

## 🧩 Module 2: `RequirementsClarifier`

Evaluates how well the user identified and clarified requirements before designing.

```python
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


# Usage
clarifier = dspy.Predict(RequirementsClarifier)
result = clarifier(
    problem_statement="Design a URL shortener like bit.ly...",
    user_questions=[
        "What's the expected traffic?",
        "Do we need analytics?",
        "What's the max URL length?"
    ],
    user_priorities=["short URL generation", "redirect speed", "high availability"],
    user_assumptions=["Assuming 100M links per month", "Assuming read-heavy workload"]
)
print(f"Clarification Score: {result.clarification_score}/100")
print(f"Missed questions: {[q['question'] for q in result.missed_questions]}")
```

---

## 🧩 Module 3: `ArchitectureDiagramEvaluator`

Evaluates the user's high-level architecture (components, data flow, connections).

```python
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


# Usage
arch_eval = dspy.Predict(ArchitectureDiagramEvaluator)
result = arch_eval(
    problem_statement="Design a URL shortener...",
    requirements={
        "functional": ["Shorten URL", "Redirect", "Custom aliases", "Analytics"],
        "non_functional": ["100M URLs/month", "99.99% uptime", "<100ms redirect"],
        "constraints": ["No external dependencies for core flow"]
    },
    user_architecture_description="Users hit the load balancer which routes to API servers. API servers check a cache (Redis) for the short URL. If miss, query the database. For writes, use a base62 encoder and store in PostgreSQL. Analytics goes through Kafka to a separate service.",
    user_components=[
        {"name": "Load Balancer", "purpose": "Distribute traffic", "technology": "NGINX"},
        {"name": "API Servers", "purpose": "Handle requests", "technology": "Node.js"},
        {"name": "Cache", "purpose": "Fast lookups", "technology": "Redis"},
        {"name": "Database", "purpose": "Persistent storage", "technology": "PostgreSQL"},
        {"name": "Message Queue", "purpose": "Async analytics", "technology": "Kafka"}
    ],
    user_data_flow="Read: LB -> API -> Redis -> (miss) -> DB. Write: LB -> API -> Encoder -> DB. Analytics: API -> Kafka -> Analytics Service -> Data Warehouse."
)
print(f"Architecture Score: {result.architecture_score}/100")
print(f"Missing: {[c['component'] for c in result.missing_components]}")
```

---

## 🧩 Module 4: `ComponentChoiceEvaluator`

Deep-dives into evaluating specific technology/component choices.

```python
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


# Usage
comp_eval = dspy.Predict(ComponentChoiceEvaluator)
result = comp_eval(
    component_name="Cache Layer",
    component_purpose="Cache frequently accessed URL mappings to reduce DB load",
    user_choice="Redis",
    user_justification="Redis is fast, in-memory, and supports TTL which is perfect for URL caching.",
    system_context="URL shortener with 100M URLs, read-heavy workload (100:1 read:write ratio)",
    scale_requirements={
        "data_volume": "100M URL mappings, ~10GB hot data",
        "read_rate": "100K RPS",
        "write_rate": "1K WPS",
        "latency_requirement": "<50ms p99 for redirects"
    }
)
print(f"Choice Rating: {result.choice_rating} — Score: {result.score}/100")
print(f"Alternatives: {[a['technology'] for a in result.alternatives]}")
```

---

## 🧩 Module 5: `TradeoffAnalyzer`

Analyzes tradeoffs in the user's design decisions.

```python
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


# Usage
tradeoff = dspy.Predict(TradeoffAnalyzer)
result = tradeoff(
    system_context="Designing a distributed chat application with 50M DAU",
    user_decisions=[
        {"decision": "Use Cassandra for message storage", "context": "Need high write throughput", "category": "database"},
        {"decision": "Eventual consistency for message delivery", "context": "Availability over consistency", "category": "consistency_model"},
        {"decision": "WebSocket connections per server", "context": "Real-time communication", "category": "protocol"},
        {"decision": "Redis for presence tracking", "context": "Fast online/offline status", "category": "cache"}
    ]
)
for t in result.tradeoff_analysis:
    print(f"\nDecision: {t['decision']}")
    print(f"  Gains: {t['gains']}")
    print(f"  Costs: {t['costs']}")
```

---

## 🧩 Module 6: `ScalabilityAssessor`

Evaluates how well the design scales under increasing load.

```python
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


# Usage
assessor = dspy.Predict(ScalabilityAssessor)
result = assessor(
    problem_statement="Design Twitter-like social network",
    user_architecture="Load balancer -> API servers -> PostgreSQL for users, Redis for sessions, S3 for media. Single master DB with read replicas.",
    user_components=[
        {"name": "PostgreSQL", "role": "Primary database"},
        {"name": "Redis", "role": "Session cache"},
        {"name": "S3", "role": "Media storage"},
        {"name": "CDN", "role": "Media delivery"}
    ],
    current_scale={"dau": "10M", "rps": "50K", "storage": "5TB"},
    growth_projections={"dau_growth": "10x in 3 years", "data_growth": "20x in 3 years"}
)
print(f"Scalability Score: {result.scalability_score}/100")
print(f"Breaking point: {result.breaking_point}")
```

---

## 🧩 Module 7: `BottleneckDetector`

Specifically focuses on finding performance bottlenecks in the design.

```python
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


# Usage
detector = dspy.Predict(BottleneckDetector)
result = detector(
    user_architecture="API Gateway -> Auth Service -> User Service -> PostgreSQL. Feed service reads from Redis cache with 5min TTL.",
    user_data_flows=[
        {"flow_name": "feed_loading", "description": "User opens app -> API Gateway -> Auth check -> Feed Service -> Redis cache (miss?) -> DB -> return", "expected_frequency": "50K/sec"},
        {"flow_name": "post_creation", "description": "User posts -> API Gateway -> Auth -> Post Service -> Write to DB -> Fanout to followers' feeds", "expected_frequency": "5K/sec"}
    ],
    scale_requirements={"rps": "100K", "p99_latency": "200ms", "availability": "99.99%"}
)
for b in result.bottlenecks[:3]:
    print(f"[{b['severity'].upper()}] {b['location']}: {b['impact']}")
```

---

## 🧩 Module 8: `DesignScoreEvaluator`

Comprehensive final scoring of the entire system design interview.

```python
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


# Usage
scorer = dspy.Predict(DesignScoreEvaluator)
result = scorer(
    problem_statement="Design a URL shortener like bit.ly",
    difficulty_level="senior",
    requirements_clarification="User asked about traffic scale, analytics needs, URL expiration, and custom aliases.",
    high_level_design="LB -> API servers -> Redis cache -> PostgreSQL. Kafka for analytics. CDN for static assets.",
    component_choices=[
        {"component": "Database", "choice": "PostgreSQL", "reason": "Relational data, ACID compliance"},
        {"component": "Cache", "choice": "Redis", "reason": "Fast lookups, TTL support"},
        {"component": "Queue", "choice": "Kafka", "reason": "High throughput for analytics"}
    ],
    data_flow_description="Read: LB -> API -> Redis -> (miss) -> DB. Write: LB -> API -> Base62 encode -> DB -> async analytics via Kafka.",
    tradeoff_discussion="User discussed CP vs AP choice, chose CP for URL mappings since correctness matters more than availability.",
    scalability_discussion="Discussed DB sharding by hash of short URL, read replicas, Redis clustering for cache scaling.",
    time_taken_minutes=40
)
print(f"Overall Score: {result.overall_score}/100")
print(f"Recommendation: {result.grade}")
print(f"Would pass: {result.would_pass_interview}")
print(f"\nDimension scores:")
for dim, score in result.dimension_scores.items():
    print(f"  {dim}: {score}/100")
```

---

## 🧠 Bonus: Full System Design Evaluation Pipeline

```python
def full_system_design_evaluation(
    topic,
    difficulty,
    user_clarification_questions,
    user_architecture,
    user_components,
    user_data_flow,
    user_tradeoffs,
    user_scalability,
    time_taken_minutes
):
    """End-to-end pipeline for evaluating a system design submission."""
    
    # Step 1: Generate the problem (if not already provided)
    problem = dspy.Predict(SystemDesignPrompter)(
        topic=topic,
        difficulty=difficulty
    )
    
    # Step 2: Evaluate requirements clarification
    clarification_eval = dspy.Predict(RequirementsClarifier)(
        problem_statement=problem.problem_statement,
        user_questions=user_clarification_questions,
        user_priorities=None,
        user_assumptions=None
    )
    
    # Step 3: Evaluate high-level architecture
    arch_eval = dspy.Predict(ArchitectureDiagramEvaluator)(
        problem_statement=problem.problem_statement,
        requirements={
            "functional": problem.functional_requirements,
            "non_functional": problem.non_functional_requirements,
            "constraints": problem.constraints
        },
        user_architecture_description=user_architecture,
        user_components=user_components,
        user_data_flow=user_data_flow
    )
    
    # Step 4: Evaluate each component choice
    component_evals = []
    for comp in user_components:
        comp_eval = dspy.Predict(ComponentChoiceEvaluator)(
            component_name=comp["component"],
            component_purpose=comp.get("purpose", ""),
            user_choice=comp["choice"],
            user_justification=comp.get("reason", ""),
            system_context=user_architecture,
            scale_requirements=problem.estimated_traffic
        )
        component_evals.append(comp_eval)
    
    # Step 5: Analyze tradeoffs
    tradeoff_decisions = [
        {"decision": f"{c['component']}: {c['choice']}", "context": c.get("reason", ""), "category": c.get("category", "general")}
        for c in user_components
    ]
    tradeoff_analysis = dspy.Predict(TradeoffAnalyzer)(
        system_context=problem.problem_statement,
        user_decisions=tradeoff_decisions
    )
    
    # Step 6: Assess scalability
    scalability = dspy.Predict(ScalabilityAssessor)(
        problem_statement=problem.problem_statement,
        user_architecture=user_architecture,
        user_components=user_components,
        current_scale=problem.estimated_traffic,
        growth_projections=None
    )
    
    # Step 7: Detect bottlenecks
    bottlenecks = dspy.Predict(BottleneckDetector)(
        user_architecture=user_architecture,
        user_data_flows=[{
            "flow_name": "primary_flow",
            "description": user_data_flow,
            "expected_frequency": f"{problem.estimated_traffic.get('requests_per_second_read', 'unknown')} RPS"
        }],
        scale_requirements=problem.estimated_traffic
    )
    
    # Step 8: Final comprehensive scoring
    final_score = dspy.Predict(DesignScoreEvaluator)(
        problem_statement=problem.problem_statement,
        difficulty_level=difficulty,
        requirements_clarification=str(user_clarification_questions),
        high_level_design=user_architecture,
        component_choices=user_components,
        data_flow_description=user_data_flow,
        tradeoff_discussion=user_tradeoffs,
        scalability_discussion=user_scalability,
        time_taken_minutes=time_taken_minutes
    )
    
    return {
        "problem": problem,
        "clarification": clarification_eval,
        "architecture": arch_eval,
        "component_evals": component_evals,
        "tradeoffs": tradeoff_analysis,
        "scalability": scalability,
        "bottlenecks": bottlenecks,
        "final_score": final_score,
    }


# Usage Example
if __name__ == "__main__":
    results = full_system_design_evaluation(
        topic="Design a Rate Limiter",
        difficulty="senior",
        user_clarification_questions=[
            "Is this per-user or global?",
            "What's the expected RPS?",
            "Should it work in a distributed environment?",
            "What happens when limit is exceeded?"
        ],
        user_architecture="Distributed rate limiter using Redis with sliding window. API Gateway checks rate limit before routing to backend services. Uses token bucket algorithm.",
        user_components=[
            {"component": "Rate Limit Store", "choice": "Redis Cluster", "reason": "Fast, distributed, supports atomic operations", "purpose": "Store rate limit counters", "category": "cache"},
            {"component": "Algorithm", "choice": "Sliding Window Log", "reason": "Accurate rate counting", "purpose": "Track request rates", "category": "algorithm"},
            {"component": "Sync", "choice": "Redis Lua Scripts", "reason": "Atomic check-and-increment", "purpose": "Ensure consistency", "category": "implementation"}
        ],
        user_data_flow="Request -> API Gateway -> Rate Limiter Service -> Redis (check counter) -> if allowed: route to backend; if denied: return 429",
        user_tradeoffs="Chose consistency over availability for rate limiting. Accepted slight latency overhead for accuracy. Trade-off between memory usage (sliding window) vs accuracy.",
        user_scalability="Redis cluster for horizontal scaling. Sharding by user ID. Local cache for hot users to reduce Redis load.",
        time_taken_minutes=45
    )
    
    print(f"\n{'='*60}")
    print(f"FINAL EVALUATION")
    print(f"{'='*60}")
    print(f"Overall Score: {results['final_score'].overall_score}/100")
    print(f"Recommendation: {results['final_score'].grade}")
    print(f"Would Pass: {results['final_score'].would_pass_interview}")
    print(f"\nStrengths:")
    for s in results['final_score'].strengths:
        print(f"  ✓ {s}")
    print(f"\nAreas to Improve:")
    for w in results['final_score'].weaknesses:
        print(f"  ✗ {w}")
```

---

## ✅ Summary Table

| Module | Core Purpose | Key Output |
|---|---|---|
| `SystemDesignPrompter` | Generate design problems | `problem_statement`, `functional_requirements`, `estimated_traffic` |
| `RequirementsClarifier` | Evaluate clarification phase | `clarification_score`, `missed_questions`, `questions_asked_analysis` |
| `ArchitectureDiagramEvaluator` | Evaluate high-level design | `architecture_score`, `missing_components`, `data_flow_analysis` |
| `ComponentChoiceEvaluator` | Evaluate tech choices | `choice_rating`, `alternatives`, `pros_of_choice`, `cons_of_choice` |
| `TradeoffAnalyzer` | Analyze design tradeoffs | `tradeoff_analysis`, `consistency_vs_availability`, `key_insight` |
| `ScalabilityAssessor` | Assess scalability | `scalability_score`, `bottleneck_analysis`, `scaling_stages` |
| `BottleneckDetector` | Find performance issues | `bottlenecks`, `latency_breakdown`, `hot_paths` |
| `DesignScoreEvaluator` | Final comprehensive scoring | `overall_score`, `grade`, `dimension_scores`, `would_pass_interview` |

---

## 🎯 Key Design Notes for System Design Modules

1. **Qualitative over Quantitative**: Unlike code evaluation (where tests pass/fail), system design is subjective. These modules use **multi-dimensional scoring** to capture nuance.

2. **Interview-Style Feedback**: The outputs are framed like real interview feedback — this makes the portal feel authentic to users preparing for FAANG interviews.

3. **Progressive Depth**: The pipeline goes from broad (requirements) → specific (components) → meta (tradeoffs) → future (scalability) → overall (final score).

4. **CAP Theorem Awareness**: Modules explicitly consider consistency/availability tradeoffs, which is critical for senior-level evaluation.

5. **Actionable Improvements**: Every module includes `recommendations`, `improvement_roadmap`, or `follow_up_topics` — so users know exactly what to study next.

---

## 🚀 Next Steps

Would you like me to:
1. **Write the Code Review & Peer Collaboration section** next?
2. **Write the Testing & TDD section**?
3. **Write the Database & API Design section**?
4. **Build a unified executor** that handles all modules across all sections with a single config?
5. **Add `dspy.ChainOfThought`** wrappers for modules that benefit from step-by-step reasoning (like `DesignScoreEvaluator`)?

Let me know which direction to take!