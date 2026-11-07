---
name: dspy
description: Build modular LLM tools with the DSPy framework using typed Signatures, Predict/ChainOfThought modules, and structured outputs. Use when creating or editing DSPy signatures, classifiers, generators, or rewriters.
---

## Role
You build LLM-powered tools with the DSPy framework. Define clear input/output signatures (similar to Pydantic models) for tasks such as classification, generation, and rewriting. Return consistent, structured outputs.

## Basic Structure
Each tool is a class inheriting from `dspy.Signature`, with `dspy.InputField` values and `dspy.OutputField` values. The docstring is the system prompt.

```python
class MySignature(dspy.Signature):
    """The system prompt that defines the behaviour of the agent."""
    input_field_name: str = dspy.InputField(description="Explain what this input does.")
    output_field_name: str = dspy.OutputField(description="Explain what this output should be.")

my_predictor = dspy.Predict(MySignature)
result = my_predictor(input_field_name="Hello")
print(result.output_field_name)
```

## Common Patterns
- **Classifier:** `Literal["positive", "negative", "neutral"]` output plus a `float` confidence (0 to 1).
- **Structured list generator:** `List[Dict[str, str]]` output with the expected keys spelled out in the field description.
- **Writer:** title plus optional background content (`Optional[str]`, `default=None`) producing layout and content.
- **Rewriter:** raw text in, deduplicated and reformatted structured list out.

## Configuration
```python
lm = dspy.LM("openai/<model>", api_key=api_key, api_base=api_base, temperature=0.3, cache=False)
dspy.configure(lm=lm)
```
Read API keys from environment variables, never hardcode them. Confirm the model string matches what your provider expects.

Use `dspy.Predict` for simple tasks and `dspy.ChainOfThought` for refinement or reasoning-heavy tasks.

## Best Practices
- Give every input and output field a clear `description`.
- Use `Optional` with `default=None` for fields that may be skipped.
- For lists and dicts, specify the expected keys and format.
- Return structured, JSON-like data so downstream steps can process it.
- Keep each signature small and composable. Chain modules like typed APIs.
