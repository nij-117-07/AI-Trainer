from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

CEFR_LEVEL = Literal["A1", "A2", "B1", "B2", "C1", "C2"]


class MCQOption(BaseModel):
    """The four answer choices for an MCQ question."""

    A: str = Field(..., description="Option A")
    B: str = Field(..., description="Option B")
    C: str = Field(..., description="Option C")
    D: str = Field(..., description="Option D")


class MCQQuestion(BaseModel):
    """A single multiple-choice question."""

    id: str = Field(..., description="Unique question identifier")
    text: str = Field(..., description="The question text")
    options: MCQOption = Field(..., description="The answer choices")
    correct: str = Field(..., description="The correct option letter (A, B, C, or D)")
    explanation: str = Field(..., description="Why the answer is correct (in the native language)")


class AssessmentRequest(BaseModel):
    """Request model for generating a personalized MCQ assessment."""

    target_language: str = Field(..., example="Spanish", description="The language being tested")
    native_language: str = Field(default="English", example="English", description="The user's native language for explanations")
    level: CEFR_LEVEL = Field(..., description="CEFR proficiency level")
    num_questions: int = Field(default=5, ge=1, le=10, description="The number of questions to generate")
    scenario: str = Field(..., example="Booking a hotel room", description="Context for the questions")
    user_details: str = Field(..., example="A business traveler", description="Persona info to personalize the questions")
    seed: str = Field(default="random_seed_123", description="Seed for deterministic variety")
    custom_instructions: Optional[str] = Field(None, description="Specific focus like 'only use past tense'")


class AssessmentResponse(BaseModel):
    """Response model containing the generated MCQ assessment."""

    assessment_title: str = Field(..., description="A creative title for this test set")
    level_rationale: str = Field(..., description="Why the questions fit the requested CEFR level")
    questions: List[MCQQuestion] = Field(..., description="The generated questions")


class FIBQuestion(BaseModel):
    """A single fill-in-the-blank question."""

    sentence: str = Field(..., description="The sentence with '____' as the missing part")
    correct_word: str = Field(..., description="The missing word/phrase")
    hint: str = Field(..., description="A clue in the target language")
    context_clue: str = Field(..., description="Translation of the sentence in the native language")


class FIBRequest(BaseModel):
    """Request model for generating fill-in-the-blank questions."""

    target_language: str = Field(..., example="German", description="The language to practice")
    level: CEFR_LEVEL = Field(..., description="CEFR proficiency level")
    num_questions: int = Field(default=3, ge=1, le=10, description="The number of sentences to generate")
    scenario: str = Field(..., example="At the pharmacy", description="Context for the sentences")
    user_details: str = Field(..., example="A nurse", description="User's background to make sentences relatable")
    seed: str = Field(default="default_seed", description="Seed for randomness")


class FIBResponse(BaseModel):
    """Response model containing the generated fill-in-the-blank questions."""

    questions: List[FIBQuestion] = Field(..., description="The generated questions")


class EvaluationRequest(BaseModel):
    """Request model for evaluating a fill-in-the-blank answer."""

    sentence_context: str = Field(..., description="The full sentence where the word fits")
    correct_word: str = Field(..., description="The expected answer")
    user_answer: str = Field(..., description="What the user typed")


class EvaluationResponse(BaseModel):
    """Response model containing the answer evaluation."""

    is_correct: bool = Field(..., description="True if the answer is functionally correct")
    status: Literal["correct", "typo", "incorrect"] = Field(..., description="The evaluation verdict")
    feedback: str = Field(..., description="Explanation of the mistake or praise")
    improvement_tip: Optional[str] = Field(None, description="Grammar rule related to the error")


class TranslationChallengeRequest(BaseModel):
    """Request model for generating a translation challenge."""

    target_language: str = Field(..., example="Japanese", description="The language the user is learning")
    native_language: str = Field(default="English", description="The user's primary language")
    level: CEFR_LEVEL = Field(..., description="CEFR proficiency level")
    scenario: str = Field(..., example="Discussing skyscraper blueprints", description="Setting of the challenge")
    user_persona: str = Field(..., example="An International Architect", description="Who the user is")
    seed: str = Field(default="arch_v105", description="Seed for deterministic mode selection")
    custom_instructions: Optional[str] = Field(None, description="Specific focus like 'use informal pronouns'")


class TranslationChallengeResponse(BaseModel):
    """Response model containing the generated translation challenge."""

    test_type: Literal["translate_to_target", "translate_to_native", "explain_meaning"] = Field(..., description="The direction of the test")
    challenge_instruction: str = Field(..., description="Specific instruction for the user")
    source_text: str = Field(..., description="The text provided to the user to process")
    correct_reference: str = Field(..., description="The ideal translation or explanation")
    vocabulary_highlights: List[str] = Field(..., description="Key words to pay attention to")
    cultural_tip: Optional[str] = Field(None, description="A note on target-culture phrasing")


class ChatMessage(BaseModel):
    """A single message in a roleplay conversation."""

    role: str = Field(..., description="The speaker role (e.g., 'User', 'Assistant')")
    content: str = Field(..., description="The message content")


class RoleplayRequest(BaseModel):
    """Request model for a conversational roleplay turn."""

    target_language: str = Field(..., example="French", description="The language of the conversation")
    level: CEFR_LEVEL = Field(..., description="CEFR proficiency level")
    scenario: str = Field(..., example="Ordering food at a busy Parisian café", description="Setting of the roleplay")
    user_persona: str = Field(..., example="A hungry tourist in a hurry", description="The role the user is playing")
    chat_history: List[ChatMessage] = Field(default_factory=list, description="Previous turns of the conversation")
    user_latest_response: str = Field(..., description="The user's most recent message")
    seed: str = Field(default="grumpy_waiter_v1", description="Seed to determine the AI character's personality")


class RoleplayResponse(BaseModel):
    """Response model containing the roleplay coach's feedback."""

    linguistic_critique: str = Field(..., description="Feedback on the user's grammar/vocabulary")
    fluency_score: int = Field(ge=1, le=10, description="1-10 score of the user's latest response")
    ai_character_response: str = Field(..., description="The AI's next line in character")
    suggested_strategies: List[str] = Field(..., description="Ways the user could phrase things better")
    is_goal_achieved: bool = Field(..., description="Whether the scenario goal was completed")
