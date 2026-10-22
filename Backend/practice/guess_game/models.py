import datetime

from pydantic import BaseModel, Field


class GuessGameRecord(BaseModel):
    """
    Data contract for a generated guess game setup.

    The guess game is stateless by design: the client's session/memory app
    persists this record and passes the fields back with each request. In a
    production system this would be a SQLAlchemy or Beanie document managed by
    that external session app. For now it serves as the persistence contract.
    """

    category: str = Field(..., description="What type of thing the user is guessing")
    difficulty: str = Field(..., description="Game difficulty: easy, medium, hard, or expert")
    mystery_item: str = Field(..., description="The hidden answer (never exposed to the user before reveal)")
    fun_fact: str = Field(..., description="Fun trivia fact shared after the reveal")
    first_hint: str = Field(..., description="The first hint shown to the user")
    max_guesses: int = Field(..., ge=1, description="Guesses allowed for this difficulty")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
