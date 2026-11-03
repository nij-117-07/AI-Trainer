# 🗄️ Database & API Design Section — DSPy Modules (Complete Code)

Here's the full implementation for all modules in the **Database & API Design Section**. I've expanded it to **4 modules** (added a `RelationshipAnalyzer`) since modeling entity relationships is a critical skill that bridges schema design and query optimization.

---

## 📦 Common Imports

```python
import dspy
from typing import List, Dict, Optional, Literal, Any
```

---

## 🧩 Module 1: `SchemaDesignEvaluator`

Evaluates a user's database schema (SQL DDL or NoSQL document structure) against a real-world use case.

```python
class SchemaDesignEvaluator(dspy.Signature):
    """You are a senior database architect reviewing a schema design.
    Evaluate the user's schema against the given use case and expected query patterns.
    Check for normalization issues, missing indexes, poor naming, anti-patterns,
    and data integrity concerns. Be specific — reference exact tables, columns,
    and constraints. Provide a corrected/optimized version of the schema."""

    user_schema: str = dspy.InputField(description="""
        The user's schema definition. Can be:
        - SQL DDL (CREATE TABLE statements)
        - NoSQL document structure (JSON/Mongoose schema)
        - ORM models (SQLAlchemy, Django models, Prisma, etc.)
    """)
    db_type: Literal["postgresql", "mysql", "mongodb", "dynamodb", "other"] = dspy.InputField(
        description="The database system being used."
    )
    use_case_description: str = dspy.InputField(description="""
        Description of what the application does. E.g., 
        'E-commerce platform with users, products, orders, and reviews.'
    """)
    query_patterns: List[str] = dspy.InputField(description="""
        List of common queries the system must support. E.g.,
        - 'Get all orders for a user with product details'
        - 'Find top 10 best-selling products this month'
    """)

    overall_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for the schema design.")
    normalization_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for normalization (10 = well-normalized for the use case).")
    naming_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for naming conventions and clarity.")
    schema_flaws: List[Dict[str, str]] = dspy.OutputField(description="""
        List of specific flaws. Each dict has:
        - 'table_or_collection': affected table/collection name
        - 'column_or_field': affected column/field (if applicable)
        - 'severity': 'critical', 'warning', or 'suggestion'
        - 'issue_type': e.g., 'missing_pk', 'missing_fk', 'redundant_column', 'bad_type', 'naming'
        - 'description': what's wrong and why it matters
    """)
    indexing_suggestions: List[Dict[str, str]] = dspy.OutputField(description="""
        Recommended indexes based on query patterns. Each dict has:
        - 'table': table name
        - 'columns': columns to index (comma-separated)
        - 'index_type': 'btree', 'hash', 'gin', 'composite', 'partial'
        - 'reason': which query pattern this supports
        - 'estimated_impact': 'high', 'medium', 'low'
    """)
    optimized_schema: str = dspy.OutputField(description="The corrected and improved schema in the same format as input.")
    explanation: str = dspy.OutputField(description="Brief explanation of the major changes made and why.")


# Usage
schema_eval = dspy.Predict(SchemaDesignEvaluator)
result = schema_eval(
    user_schema="""
    CREATE TABLE users (id INT, name VARCHAR(100), email VARCHAR(100));
    CREATE TABLE orders (id INT, user_id INT, total FLOAT, date VARCHAR(20));
    CREATE TABLE order_items (id INT, order_id INT, product_name VARCHAR(100), qty INT);
    """,
    db_type="postgresql",
    use_case_description="E-commerce platform handling 10k orders/day with product search and user dashboards.",
    query_patterns=[
        "Get all orders for a user with items and product details",
        "Search products by name with pagination",
        "Calculate monthly revenue per user"
    ]
)
print(f"Score: {result.overall_score}/10")
for flaw in result.schema_flaws:
    print(f"[{flaw['severity']}] {flaw['description']}")
```

---

## 🧩 Module 2: `RelationshipAnalyzer`

Analyzes entity relationships and ensures proper cardinality, foreign keys, and referential integrity. *(Bonus module)*

```python
class RelationshipAnalyzer(dspy.Signature):
    """You are a data modeling expert specializing in entity-relationship design.
    Given a set of entities and their described relationships, analyze the 
    cardinality, identify missing relationships, detect circular dependencies,
    and recommend the proper modeling approach (1:1, 1:N, M:N with join tables,
    polymorphic, etc.). Handle both relational and document-based databases."""

    entities: List[Dict[str, str]] = dspy.InputField(description="""
        List of entities. Each dict has:
        - 'name': entity name (e.g., 'User')
        - 'description': what it represents
        - 'key_attributes': comma-separated main attributes
    """)
    described_relationships: List[str] = dspy.InputField(description="""
        Natural language description of relationships. E.g.,
        - 'A user can have many orders'
        - 'An order belongs to one user and has many items'
    """)
    db_type: Literal["relational", "document", "graph"] = dspy.InputField(
        description="Type of database being used."
    )

    relationship_map: List[Dict[str, str]] = dspy.OutputField(description="""
        Structured list of all relationships. Each dict has:
        - 'from_entity': source entity
        - 'to_entity': target entity
        - 'cardinality': '1:1', '1:N', 'M:N'
        - 'ownership': 'parent-child', 'peer', 'weak'
        - 'implementation': how to model it (e.g., 'FK on orders', 'join table order_items')
        - 'optional_or_required': 'required', 'optional'
    """)
    missing_relationships: List[Dict[str, str]] = dspy.OutputField(description="""
        Relationships implied by the use case but not described by the user.
        Each dict has: 'entities', 'suggested_cardinality', 'reason'.
    """)
    issues: List[Dict[str, str]] = dspy.OutputField(description="""
        Modeling issues found. Each dict has:
        - 'issue_type': e.g., 'circular_dependency', 'ambiguous_cardinality', 'missing_join_table'
        - 'entities_involved': list of entities
        - 'description': what's wrong
        - 'fix': recommended solution
    """)
    erd_description: str = dspy.OutputField(description="""
        A textual description of the complete ER diagram that could be used 
        to generate a visual diagram (e.g., in Mermaid or PlantUML syntax).
    """)


# Usage
rel_analyzer = dspy.Predict(RelationshipAnalyzer)
result = rel_analyzer(
    entities=[
        {"name": "User", "description": "Platform user", "key_attributes": "id, name, email"},
        {"name": "Post", "description": "Blog post", "key_attributes": "id, title, content, published_at"},
        {"name": "Comment", "description": "Comment on a post", "key_attributes": "id, body, created_at"},
        {"name": "Tag", "description": "Categorization label", "key_attributes": "id, name"}
    ],
    described_relationships=[
        "A user writes posts",
        "Posts have comments",
        "Posts can have multiple tags"
    ],
    db_type="relational"
)
for rel in result.relationship_map:
    print(f"{rel['from_entity']} → {rel['to_entity']} ({rel['cardinality']})")
```

---

## 🧩 Module 3: `QueryOptimizer`

Analyzes a user's SQL query for correctness, performance, and suggests optimizations.

```python
class QueryOptimizer(dspy.Signature):
    """You are a database performance expert specializing in query optimization.
    Analyze the user's SQL query for correctness, performance bottlenecks, and 
    readability. Explain WHY each optimization helps — don't just give the answer.
    Consider execution plans, index usage, joins, subqueries, and common anti-patterns
    like SELECT *, N+1 queries, implicit conversions, and missing WHERE clauses."""

    user_query: str = dspy.InputField(description="The user's SQL query to analyze.")
    schema_context: str = dspy.InputField(description="""
        Relevant schema info — table definitions, existing indexes, row counts (if known).
        Helps tailor optimization advice to the actual data scale.
    """)
    expected_result_description: str = dspy.InputField(
        description="What the query is supposed to return — helps verify correctness."
    )
    db_type: Literal["postgresql", "mysql", "sqlite", "sqlserver", "other"] = dspy.InputField(
        description="Database system — optimizations vary by engine."
    )

    is_correct: bool = dspy.OutputField(description="True if the query returns the expected result.")
    correctness_issues: List[str] = dspy.OutputField(description="List of correctness problems (empty if correct).")
    performance_rating: Literal["Excellent", "Good", "Poor", "Critical"] = dspy.OutputField(
        description="Overall performance rating of the query."
    )
    bottlenecks: List[Dict[str, str]] = dspy.OutputField(description="""
        Performance bottlenecks found. Each dict has:
        - 'issue': what's slow (e.g., 'full table scan', 'nested loop join')
        - 'location': part of the query causing it
        - 'severity': 'high', 'medium', 'low'
        - 'explanation': why it's slow
    """)
    optimized_query: str = dspy.OutputField(description="The rewritten, optimized version of the query.")
    optimization_explanations: List[Dict[str, str]] = dspy.OutputField(description="""
        For each change made, explain WHY. Each dict has:
        - 'change': what was changed
        - 'reason': why it improves performance
        - 'expected_improvement': 'significant', 'moderate', 'minor'
    """)
    recommended_indexes: List[str] = dspy.OutputField(description="Suggested CREATE INDEX statements to support the query.")
    alternative_approaches: List[str] = dspy.OutputField(description="""
        Other ways to solve the same problem (e.g., 'use a CTE', 'use a materialized view',
        'handle in application layer').
    """)


# Usage
query_opt = dspy.Predict(QueryOptimizer)
result = query_opt(
    user_query="""
    SELECT * FROM orders o 
    WHERE o.user_id IN (SELECT id FROM users WHERE city = 'NYC')
    AND o.created_at > '2024-01-01'
    ORDER BY o.created_at DESC
    """,
    schema_context="""
    orders: 5M rows, indexes on (id), (user_id)
    users: 500k rows, indexes on (id)
    """,
    expected_result_description="All orders from NYC users placed after Jan 1, 2024, newest first.",
    db_type="postgresql"
)
print(f"Correct: {result.is_correct}")
print(f"Performance: {result.performance_rating}")
print(f"\nOptimized:\n{result.optimized_query}")
```

---

## 🧩 Module 4: `APIDesignReviewer`

Reviews REST/GraphQL API endpoint designs for best practices, naming, and consistency.

```python
class APIDesignReviewer(dspy.Signature):
    """You are a senior backend engineer reviewing API designs.
    Evaluate the user's API design against industry best practices for the 
    specified style (REST or GraphQL). Check for:
    - Proper use of HTTP methods (GET, POST, PUT, PATCH, DELETE)
    - Correct status codes
    - RESTful URL naming (nouns, not verbs; plural resources)
    - Consistent response structures
    - Pagination, filtering, and sorting patterns
    - Authentication/authorization considerations
    - Error response format
    Be specific — reference exact endpoints and suggest concrete improvements."""

    user_api_design: str = dspy.InputField(description="""
        The user's API design. Can be:
        - OpenAPI/Swagger YAML or JSON
        - List of endpoints with methods, paths, request/response bodies
        - GraphQL schema
        - Plain text description of routes
    """)
    api_style: Literal["REST", "GraphQL", "gRPC"] = dspy.InputField(
        description="The API paradigm being used."
    )
    application_context: str = dspy.InputField(description="""
        What the API is for. E.g., 'Backend for a task management app with teams,
        projects, and tasks.'
    """)
    target_clients: List[str] = dspy.InputField(description="""
        Who consumes this API. E.g., ['web frontend', 'mobile app', 'third-party integrations'].
        Affects design decisions like pagination and field selection.
    """)

    overall_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for the API design.")
    restfulness_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for adherence to REST principles (or equivalent for GraphQL/gRPC).")
    consistency_score: float = dspy.OutputField(description="Score from 0.0 to 10.0 for naming and structural consistency.")
    issues: List[Dict[str, str]] = dspy.OutputField(description="""
        Specific issues found. Each dict has:
        - 'endpoint': affected endpoint (e.g., 'POST /getUser')
        - 'severity': 'critical', 'warning', or 'suggestion'
        - 'category': e.g., 'naming', 'http_method', 'status_code', 'pagination', 'security'
        - 'description': what's wrong
        - 'recommended_fix': how to fix it
    """)
    improved_design: str = dspy.OutputField(description="The corrected API design in the same format as input.")
    missing_endpoints: List[Dict[str, str]] = dspy.OutputField(description="""
        Endpoints that should exist based on the application context but are missing.
        Each dict has: 'method', 'path', 'purpose', 'suggested_request_body'.
    """)
    response_format_recommendation: str = dspy.OutputField(description="""
        Recommended standard response envelope format. E.g.,
        {'success': bool, 'data': ..., 'meta': {...}, 'errors': [...]}
    """)
    pagination_recommendation: str = dspy.OutputField(description="""
        Recommended pagination strategy (cursor-based vs offset-based) with reasoning.
    """)
    versioning_strategy: str = dspy.OutputField(description="Recommended API versioning approach (URL, header, etc.).")


# Usage
api_reviewer = dspy.Predict(APIDesignReviewer)
result = api_reviewer(
    user_api_design="""
    POST /getUsers - returns all users
    POST /createUser - creates a user
    GET /deleteUser?id=5 - deletes a user
    PUT /updateUser/5 - updates a user
    GET /getUserPosts/5 - gets posts for user 5
    """,
    api_style="REST",
    application_context="Blog platform with users and posts.",
    target_clients=["web frontend", "mobile app"]
)
print(f"Score: {result.overall_score}/10")
for issue in result.issues:
    print(f"[{issue['severity']}] {issue['endpoint']}: {issue['description']}")
print(f"\nImproved design:\n{result.improved_design}")
```

---

## 🧠 Bonus: Chaining into a Database Design Pipeline

Here's how these modules chain together for a complete DB/API design review flow:

```python
def full_db_api_design_review(
    entities, relationships, use_case, query_patterns, 
    api_design, api_style, db_type="postgresql"
):
    """End-to-end review: relationships → schema → queries → API."""
    
    # Step 1: Analyze entity relationships
    relationships_result = dspy.Predict(RelationshipAnalyzer)(
        entities=entities,
        described_relationships=relationships,
        db_type="relational" if db_type != "mongodb" else "document"
    )
    
    # Step 2: Evaluate the schema
    schema_result = dspy.Predict(SchemaDesignEvaluator)(
        user_schema=relationships_result.erd_description,  # or user's actual DDL
        db_type=db_type,
        use_case_description=use_case,
        query_patterns=query_patterns
    )
    
    # Step 3: Optimize critical queries
    query_results = []
    for query in query_patterns[:3]:  # analyze top 3 queries
        opt = dspy.Predict(QueryOptimizer)(
            user_query=query,
            schema_context=schema_result.optimized_schema,
            expected_result_description=query,
            db_type=db_type
        )
        query_results.append(opt)
    
    # Step 4: Review the API design
    api_result = dspy.Predict(APIDesignReviewer)(
        user_api_design=api_design,
        api_style=api_style,
        application_context=use_case,
        target_clients=["web frontend", "mobile app"]
    )
    
    return {
        "relationships": relationships_result,
        "schema": schema_result,
        "query_optimizations": query_results,
        "api_review": api_result,
    }


# Example usage
if __name__ == "__main__":
    result = full_db_api_design_review(
        entities=[
            {"name": "User", "description": "App user", "key_attributes": "id, name, email"},
            {"name": "Order", "description": "Purchase order", "key_attributes": "id, total, status"},
            {"name": "Product", "description": "Sellable item", "key_attributes": "id, name, price"},
        ],
        relationships=[
            "A user places many orders",
            "An order contains many products",
            "A product can be in many orders"
        ],
        use_case="E-commerce platform processing 10k orders/day.",
        query_patterns=[
            "SELECT * FROM orders WHERE user_id = 5",
            "SELECT p.name, SUM(oi.qty) FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.name"
        ],
        api_design="GET /getOrders, POST /createOrder, GET /getProducts",
        api_style="REST",
        db_type="postgresql"
    )
    
    print(f"Schema Score: {result['schema'].overall_score}/10")
    print(f"API Score: {result['api_review'].overall_score}/10")
```

---

## ✅ Summary Table

| Module | Core Purpose | Key Output |
|---|---|---|
| `SchemaDesignEvaluator` | Grade DB schema against use case | `overall_score`, `schema_flaws[]`, `optimized_schema` |
| `RelationshipAnalyzer` | Validate entity relationships | `relationship_map[]`, `missing_relationships[]`, `erd_description` |
| `QueryOptimizer` | Fix slow/incorrect SQL | `optimized_query`, `bottlenecks[]`, `recommended_indexes[]` |
| `APIDesignReviewer` | Review REST/GraphQL design | `improved_design`, `issues[]`, `missing_endpoints[]` |

---

## 🎯 Key Design Notes

1. **`db_type` everywhere** — Every module takes the database type as input because optimizations differ significantly between PostgreSQL, MySQL, MongoDB, etc.

2. **`schema_context` in QueryOptimizer** — Real query optimization needs to know table sizes and existing indexes. A query that's fine for 100 rows is terrible for 10M rows.

3. **`optimized_schema` as a string** — The evaluator returns the corrected schema in the *same format* the user provided (DDL, JSON, ORM), so it's directly usable.

4. **RelationshipAnalyzer is the glue** — It bridges the gap between "I have entities" and "I have a schema" by producing an ERD description that feeds into the schema evaluator.

---

### 🚀 Next Steps

Would you like me to:
1. **Write the Security & Vulnerability Management section** next?
2. **Write the System Design & Architecture section**?
3. **Build a unified config executor** (like your `FlexibleWriter`) that wraps all these modules with a single API key/model config?
4. **Add `dspy.ChainOfThought`** to modules like `QueryOptimizer` where step-by-step reasoning improves output quality?

Let me know which direction to take!