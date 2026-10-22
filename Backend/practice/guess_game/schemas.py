from typing import List, Literal, Optional

from pydantic import BaseModel, Field

GameCategory = Literal["word", "movie", "sentence", "book", "celebrity", "song"]
GameDifficulty = Literal["easy", "medium", "hard", "expert"]


class GameStartRequest(BaseModel):
    """Request model for starting a new guessing game."""

    category: GameCategory = Field(..., description="What type of thing the user will guess")
    difficulty: GameDifficulty = Field(..., description="Difficulty affecting obscurity and hint quality")
    vocabulary_theme: Optional[str] = Field(
        None,
        description="Optional theme constraint (e.g., 'sci-fi movies', 'animals', '90s slang')",
    )


class GameStartResponse(BaseModel):
    """Response model containing the generated setup for the client to persist."""

    mystery_item: str = Field(..., description="The hidden answer — persisted by the client session store, never shown to the user before reveal")
    fun_fact: str = Field(..., description="Fun trivia fact to share after the reveal")
    first_hint: str = Field(..., description="The first vague hint")
    max_guesses: int = Field(..., ge=1, description="Guesses allowed for this difficulty")
    message: str = Field(..., description="Human-readable confirmation of the new game")
    status: str = "success"


class HintRequest(BaseModel):
    """Request model for requesting the next hint."""

    mystery_item: str = Field(..., description="The hidden answer stored by the client session store")
    category: GameCategory = Field(..., description="What type of thing is being guessed")
    previous_hints: List[str] = Field(
        default_factory=list,
        description="Hints already given, to avoid repetition",
    )


class HintResponse(BaseModel):
    """Response model containing the next hint."""

    hint: str = Field(..., description="A fresh, increasingly revealing hint")
    encouragement: str = Field(..., description="An encouraging message to keep the user engaged")
    hints_used: List[str] = Field(..., description="All hints shown so far (previous + new)")
    status: str = "success"


class GuessRequest(BaseModel):
    """Request model for evaluating a user's guess."""

    mystery_item: str = Field(..., description="The hidden answer stored by the client session store")
    category: GameCategory = Field(..., description="What type of thing is being guessed")
    difficulty: GameDifficulty = Field(..., description="Current difficulty level")
    guess: str = Field(..., description="The user's attempted guess")


class GuessResponse(BaseModel):
    """Response model containing the guess evaluation."""

    correct: bool = Field(..., description="Whether the guess matches the mystery item")
    feedback: str = Field(..., description="Encouraging if close, guiding if wrong")
    closeness: float = Field(..., ge=0.0, le=1.0, description="How close the guess was (0.0 to 1.0)")
    suggestion: str = Field(..., description="A subtle nudge for the next guess (not the answer)")
    status: str = "success"


class CoachRequest(BaseModel):
    """Request model for requesting coaching guidance."""

    mystery_item: str = Field(..., description="The hidden answer stored by the client session store")
    category: GameCategory = Field(..., description="What type of thing is being guessed")
    failed_guesses: List[str] = Field(..., description="Previous incorrect guesses")
    hint_number: int = Field(..., ge=1, description="Current hint stage")


class CoachResponse(BaseModel):
    """Response model containing coaching guidance."""

    coaching: str = Field(..., description="Encouraging guidance with a fresh angle")
    framework: str = Field(..., description="A mental model or approach to help guess better")
    partial_reveal: Optional[str] = Field(None, description="Optional partial reveal for hard stages")
    should_hint: bool = Field(..., description="Whether the user should ask for a hint")
    status: str = "success"
