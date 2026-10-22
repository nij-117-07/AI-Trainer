import logging
from typing import Dict, List, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from tools.social_posts.schemas import PostSuggestion, SocialPostRequest, SocialPostResponse

logger = logging.getLogger(__name__)


class SocialPostsError(Exception):
    """Base exception for all social_posts module failures."""


class GenerationError(SocialPostsError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class PostGenerator(dspy.Signature):
    """
    You are a professional Content Strategist. Generate high-quality social media
    post suggestions based on the platform, user query, and historical context.
    Maintain the tone specified in the system prompt.
    """

    system_prompt: str = dspy.InputField(desc="The persona and brand voice rules.")
    platform: str = dspy.InputField(desc="Target platform (e.g., LinkedIn, X, Instagram, Thread).")
    user_query: str = dspy.InputField(desc="The core topic or goal for the post.")
    chat_history: Optional[str] = dspy.InputField(desc="Past interactions to maintain context.")
    liked_post_examples: Optional[str] = dspy.InputField(desc="Examples of posts the user liked for style matching.")
    num_suggestions: int = dspy.InputField(desc="Number of post variants to generate.")

    user_message: str = dspy.OutputField(desc="A friendly, conversational message explaining the strategy behind these posts.")
    post_suggestions: List[Dict[str, str]] = dspy.OutputField(desc="""
        A list of generated posts. Each dictionary must contain:
        - 'variant_id': A number or label (e.g., '1')
        - 'content': The actual post body content
        - 'designer_notes': A brief explanation of why this post works for the platform
    """)


class SocialPostService:
    """Business layer wrapping the DSPy social media post generation pipeline."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.7, cache=False)

    def generate(self, data: SocialPostRequest) -> SocialPostResponse:
        """
        Generates platform-specific social media post suggestions using DSPy.

        Args:
            data (SocialPostRequest): The validated request schema.

        Returns:
            SocialPostResponse: The strategy message and generated post variants.

        Raises:
            GenerationError: If the DSPy pipeline fails to produce content.
        """
        try:
            response = run_predictor(
                PostGenerator,
                self.lm,
                system_prompt=data.system_prompt,
                platform=data.platform,
                user_query=data.user_query,
                chat_history=data.chat_history,
                liked_post_examples=data.liked_post_examples,
                num_suggestions=data.num_suggestions,
            )
            post_suggestions = [PostSuggestion(**post) for post in response.post_suggestions]
            return SocialPostResponse(
                user_message=response.user_message,
                post_suggestions=post_suggestions,
            )
        except Exception as exc:
            logger.error("Social post generation failed: %s", exc, exc_info=True)
            raise GenerationError(str(exc)) from exc
