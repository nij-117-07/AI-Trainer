You are working with the **DSPy framework** to define and interact with LLM-powered tools using clear input/output signatures. DSPy models use a structure similar to Pydantic to declare what inputs they expect and what outputs they produce.
  
Your job is to:
- Build **modular LLM tools** using DSPy.
- Define clean interfaces for tasks like classification, generation, and rewriting.
- Return consistent and structured outputs.
  
---
  
### 🔧 **Basic Structure of a DSPy Tool**
  
Every DSPy tool is defined using a class that inherits from `dspy.Signature`. Each tool includes:
- **Input fields** (`dspy.InputField`) – values the model receives
- **Output fields** (`dspy.OutputField`) – values the model should return
  
```python
class MySignature(dspy.Signature):
    """The System Prompt that defines and behavriour of the agent."""
    input_field_name: str = dspy.InputField(description="Explain what this input does.")
    output_field_name: str = dspy.OutputField(description="Explain what this output should be.")
```
  
Then, instantiate it:
```python
my_predictor = dspy.Predict(MySignature)
```
  
Call it like a function:
```python
result = my_predictor(input_field_name="Hello")
print(result.output_field_name)
```
  
---
  
### 🧩 **Common Use Case Examples**
  
#### ✅ 1. **Sentiment Classifier**
  
```python
class SentimentClassifier(dspy.Signature):
    """You are a Sentiment Classifier Who work is to check the sentiment of the given text and tell hte user about it."""
    sentence: str = dspy.InputField(description="Sentence to classify.")
    sentiment: Literal["positive", "negative", "neutral"] = dspy.OutputField(description="Detected sentiment.")
    confidence: float = dspy.OutputField(description="Confidence score (0 to 1).")
```
  
#### ✅ 2. **Slide List Generator for PPT**
  
```python
class SlideListCreator(dspy.Signature):
"""You are Slide list creator who work is generate the slide contnet list on the basis of topic shared."""
    presentation_topic: str = dspy.InputField(description="Presentation's main topic.")
    audience: str = dspy.InputField(description="Target audience.")
    tone: str = dspy.InputField(description="Presentation tone (e.g., formal, persuasive).")
    slide_plan: List[Dict[str, str]] = dspy.OutputField(description="""
        A list of slides. Each contains:
        - 'title': Title of the slide
        - 'web_search': 'yes' or 'no'
        - 'web_query': If web_search is 'yes', give a search query; else empty string
    """)
```
  
#### ✅ 3. **Slide Writer from Title + Extracted Content**
  
```python
class SlideWriter(dspy.Signature):
    slide_title: str = dspy.InputField(description="Title of the slide.")
    extracted_content: Optional[str] = dspy.InputField(
        default=None,
        description="Background content for the slide. If missing, generate content from title."
    )
    slide_layout: str = dspy.OutputField(description="Suggested layout (e.g., bullet list, two-column).")
    slide_content: str = dspy.OutputField(description="Generated content for the slide.")
```
  
#### ✅ 4. **Slide Rewriter from Raw Text**
  
```python
class SlideRewriter(dspy.Signature):
    """You are Slide rewriter you have given a whole slides content and you have to rewrite them such that the content doen'st repeat more that one and make format and tone better"""
    raw_slides_text: str = dspy.InputField(description="String with raw slide titles and content.")
    final_slides: List[Dict[str, str]] = dspy.OutputField(description="""
        Structured list of slides.
        Each includes:
        - 'title': Slide title
        - 'content': Slide body
    """)
```
  
---
  

```python
import os
import dspy
from typing import Optional

# 1. Setup Configuration
# Use environment variables for keys to keep them out of your source code
api_key = os.getenv('OPENAI_API_KEY', 'sk-1234')
api_base = 'http://localhost:4567/v1'

# Initialize the Language Model
# Note: Ensure the model string matches exactly what your local provider expects
lm = dspy.LM(
    'openai/qwen', 
    api_key=api_key, 
    api_base=api_base,
    temperature=0.3,
    cache=False
)

dspy.configure(lm=lm)

# 2. Define the Signature
class QueryRefiner(dspy.Signature):
    """
    Refine the user’s web search query for better search engine results.
    Focus on adding technical specificity and removing ambiguity.
    """
    user_query: str = dspy.InputField(desc="The raw query input by the user.")
    context: Optional[str] = dspy.InputField(desc="Optional user goal or background info.")
    
    refined_query: str = dspy.OutputField(desc="A precise, search-engine optimized query.")

# 3. Execution Logic
def refine_search(query: str, context: str = ""):
    # dspy.Predict is the basic predictor; 
    # dspy.ChainOfThought is usually better for "Refining" tasks
    refiner = dspy.ChainOfThought(QueryRefiner)
    
    prediction = refiner(user_query=query, context=context)
    return prediction.refined_query

# 4. Usage
if __name__ == "__main__":
    original_query = "best logging tool in python"
    user_context = "production grade asynchronous microservices"
    
    refined = refine_search(original_query, user_context)
    
    print(f"Original: {original_query}")
    print(f"Refined:  {refined}")
```


  
### 🔁 **Best Practices**
  
- Always include clear `description` fields in inputs/outputs.
- Use `Optional` with `default=None` for fields that may be skipped.
- For lists or dictionaries, specify the expected keys/format.
- Output structured JSON-like data to allow further processing.
  
---
  
### 📌 Summary
  
- DSPy helps define **LLM workflows as modular components**.
- Each component has typed inputs and outputs — like an API.
- You can chain DSPy tools together or run them independently.
- Clean design = Better outputs & automation.
  
can you give the dspy code for the  language tranlator
