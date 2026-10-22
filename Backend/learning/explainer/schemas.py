from typing import List, Optional
from pydantic import BaseModel, Field

EXPERTISE_LEVELS = str
SOCRATIC_LEVELS = str
EXPLANATION_STYLES = str
QUESTION_CATEGORIES = str


class ExplanationRequest(BaseModel):
    """Request model for a structured AI explanation of a topic."""

    topic: str = Field(..., example="Quantum Entanglement", description="The subject to explain.")
    expertise_level: EXPERTISE_LEVELS = Field(
        default="intermediate",
        description="Target audience knowledge level.",
    )
    context: Optional[str] = Field(None, example="Use a metaphor involving shoes.")


class ExplanationResponse(BaseModel):
    """Response model containing the generated educational content."""

    explanation: str = Field(..., description="The generated educational content.")
    key_takeaway: str = Field(..., description="One sentence summary of the core concept.")


class TutorialRequest(BaseModel):
    """Request model for a full A-to-Z Markdown tutorial."""

    topic: str = Field(..., example="FastAPI Architecture")
    expertise_level: EXPERTISE_LEVELS = Field(..., description="Target audience knowledge level (any value accepted).")
    explanation_style: str = Field(
        ..., description="The format or lens used for the explanation."
    )


class TutorialResponse(BaseModel):
    """Response model containing the Markdown formatted tutorial."""

    full_explanation: str = Field(..., description="Markdown formatted tutorial content.")


class RoadmapItem(BaseModel):
    """A single concept step inside an A-to-Z roadmap."""

    concept: str = Field(..., description="The name of the principle or step.")
    explanation: str = Field(..., description="Detailed description based on style.")


class AtoZRequest(BaseModel):
    """Request model for a structured A-to-Z roadmap."""

    topic: str = Field(..., example="UI vs UX differences")
    expertise_level: EXPERTISE_LEVELS = Field(..., description="Target audience knowledge level.")
    explanation_style: EXPLANATION_STYLES = Field(..., description="The format or lens for the explanation.")


class AtoZResponse(BaseModel):
    """Response model containing the structured A-to-Z roadmap."""

    summary: str = Field(..., description="High-level overview.")
    knowledge_roadmap: List[RoadmapItem] = Field(..., description="Chronological list of key concepts.")
    practical_takeaway: str = Field(..., description="Final how-to or conclusion.")


class FeynmanRequest(BaseModel):
    """Request model for a Feynman-technique simplification."""

    complex_topic: str = Field(..., example="Quantum Entanglement", description="The jargon-heavy concept.")
    target_age: int = Field(default=5, ge=3, le=25, description="The age level for the simplification.")


class FeynmanResponse(BaseModel):
    """Response model containing the simplified explanation."""

    explanation: str = Field(..., description="Step-by-step simple explanation.")
    key_metaphors: List[str] = Field(..., description="Primary metaphors used in the explanation.")
    fun_analogy: str = Field(..., description="A creative 'Imagine if...' scenario.")


class OrchestratorRequest(BaseModel):
    """Request model for the streaming A-to-Z journey."""

    topic: str = Field(..., description="The subject to cover in the journey.")
    expertise: str = Field(default="Undergraduate", description="Depth level, e.g., 'Undergraduate' or 'PhD'.")


class ChapterStream(BaseModel):
    """A single deep-dive chapter emitted during the streaming journey."""

    chapter_index: int = Field(..., description="1-based chapter position.")
    chapter_title: str = Field(..., description="The chapter heading.")
    content: str = Field(..., description="The technical deep-dive content.")
    analogy: str = Field(..., description="A mental model or analogy for the section.")
    jargon: List[str] = Field(..., description="Glossary of key terms for the section.")


class PlanStream(BaseModel):
    """The initial plan event emitted before the deep-dive chapters."""

    titles: List[str] = Field(..., description="Chronological list of chapters to cover.")
    prerequisites: List[str] = Field(..., description="What the learner needs before starting.")


class SocraticQuestion(BaseModel):
    """A single Socratic inquiry targeting a specific cognitive faculty."""

    question_text: str = Field(..., description="The Socratic inquiry.")
    cognitive_challenge: str = Field(..., description="The mental faculty being targeted.")
    guiding_hint: Optional[str] = Field(None, description="A nudge or thought experiment (no answers).")


class SocraticRequest(BaseModel):
    """Request model for a Socratic mentoring session."""

    topic: str = Field(..., example="Supply and Demand Equilibrium")
    context: str = Field(..., example="Prices are set where quantity supplied equals quantity demanded.")
    user_instructions: Optional[str] = Field(None, example="Make it relevant to technology products.")
    level: SOCRATIC_LEVELS = "intermediate"
    question_category: QUESTION_CATEGORIES = Field(..., description="The cognitive framework for the questions.")
    num_questions: int = Field(default=3, ge=1, le=10)


class SocraticResponse(BaseModel):
    """Response model containing the Socratic questions and pedagogical goal."""

    pedagogical_goal: str = Field(..., description="The core realization the user needs to reach.")
    question_category: QUESTION_CATEGORIES
    questions_for_discovery: List[SocraticQuestion]


class RoadmapStep(BaseModel):
    """A single phase within a personalized learning path."""

    phase: str = Field(..., description="e.g., Bridge, Deep Dive, Challenge")
    description: str = Field(..., description="What will be covered in this phase.")
    learning_objective: str = Field(..., description="The specific goal of this phase.")


class LearningPathRequest(BaseModel):
    """Request model for architecting a personalized learning path."""

    topic: str = Field(..., example="Asynchronous Python (asyncio)")
    context: str = Field(..., description="Source material or documentation.")
    past_learning: str = Field(..., description="Summary of user's previous knowledge.")
    user_level: SOCRATIC_LEVELS
    user_hopes: str = Field(..., description="What the user wants to achieve today.")
    additional_instructions: Optional[str] = Field(None, description="Extra constraints.")


class LearningPathResponse(BaseModel):
    """Response model containing the personalized learning roadmap."""

    session_id: str = Field(..., description="UUID for the current session.")
    rationale: str = Field(..., description="Connection between past knowledge and current topic.")
    the_crux: str = Field(..., description="The core 'Aha!' moment.")
    learning_roadmap: List[RoadmapStep]
    suggested_focus: str = Field(..., description="The 'north star' for the session.")
