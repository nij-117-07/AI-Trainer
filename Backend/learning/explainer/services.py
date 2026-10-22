import json
import logging
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional

import dspy

from core.dspy_utils import build_lm, run_predictor
from learning.explainer.schemas import (
    AtoZRequest,
    ExplanationRequest,
    FeynmanRequest,
    LearningPathRequest,
    SocraticRequest,
    TutorialRequest,
)

logger = logging.getLogger(__name__)


class ExplainerError(Exception):
    """Base exception for all explainer module failures."""


class GenerationError(ExplainerError):
    """Raised when the underlying DSPy pipeline fails to produce content."""


class GeneralExplainer(dspy.Signature):
    """
    You are a helpful and concise educator. Provide a clear explanation of
    the provided topic. Focus on the core concepts requested without
    unnecessary fluff. Adapt your language to the specified expertise level.
    """

    topic: str = dspy.InputField(description="The specific subject or question to explain.")
    expertise_level: str = dspy.InputField(
        description="The target audience's knowledge level."
    )
    context: Optional[str] = dspy.InputField(
        default=None,
        description="Optional context or specific area of interest within the topic.",
    )

    explanation: str = dspy.OutputField(
        description="A clear, focused explanation of the topic."
    )
    key_takeaway: str = dspy.OutputField(
        description="A single sentence summarizing the most important point."
    )


class TopicExplainerString(dspy.Signature):
    """
    You are an expert educator. Provide a comprehensive, A-to-Z explanation
    of a topic formatted as a single, cohesive tutorial.
    Use Markdown for headers, bold text for key terms, and bullet points.
    Ensure the depth matches the expertise level and the tone matches the style.
    """

    topic: str = dspy.InputField(description="The subject to explain.")
    expertise_level: str = dspy.InputField()
    explanation_style: str = dspy.InputField()

    full_explanation: str = dspy.OutputField(
        description="A full, markdown-formatted guide from basics to advanced mastery."
    )


class AtoZExplainer(dspy.Signature):
    """
    You are an expert educator. Provide a comprehensive, structured 'A to Z'
    explanation of a topic. Structure the response from foundational concepts
    to advanced applications, ensuring the tone and complexity match the
    requested level and type.
    """

    topic: str = dspy.InputField(description="The subject or concept the user wants to understand.")
    expertise_level: str = dspy.InputField(
        description="The depth of the explanation."
    )
    explanation_style: str = dspy.InputField(
        description="The format or lens used for the explanation."
    )

    summary: str = dspy.OutputField(description="A high-level overview of the topic.")
    knowledge_roadmap: List[Dict[str, str]] = dspy.OutputField(description="""
        A chronological list of key concepts (A to Z). Each item includes:
        - 'concept': The name of the principle or step
        - 'explanation': A detailed description based on the style and level
    """)
    practical_takeaway: str = dspy.OutputField(description="A final 'how-to' or conclusion for the user.")


class FeynmanExplainer(dspy.Signature):
    """
    Explain complex topics using the Feynman Technique: simplify until it's
    understandable to a child. Avoid jargon, use vivid metaphors, and
    break down concepts into fundamental building blocks.
    """

    complex_topic: str = dspy.InputField(desc="The difficult concept or jargon-heavy data.")
    target_age: int = dspy.InputField(desc="The age level of rewrite (e.g., 5, 12, or 20).")

    explanation: str = dspy.OutputField(desc="A step-by-step simple explanation using a metaphor.")
    key_metaphors: List[str] = dspy.OutputField(desc="A list of the primary metaphors used.")
    fun_analogy: str = dspy.OutputField(desc="A creative 'Imagine if...' scenario.")


class ExplainerArchitect(dspy.Signature):
    """
    You are a Master Educator. Your goal is to break down a complex topic into a
    logical progression from absolute beginner (A) to advanced expert (Z).
    """

    topic: str = dspy.InputField(desc="The subject the user wants to understand.")
    depth_level: str = dspy.InputField(desc="Level of detail (e.g., Undergraduate, PhD, Hobbyist).")

    knowledge_graph_outline: List[str] = dspy.OutputField(
        desc="A list of 5-8 chronological chapters to cover the topic fully."
    )
    core_prerequisites: List[str] = dspy.OutputField(
        desc="What the user needs to know before starting."
    )


class SectionExplainer(dspy.Signature):
    """
    You are an Expert Subject Matter Specialist. Provide a high-density,
    clear, and structured explanation for a specific module of the topic.
    """

    full_topic: str = dspy.InputField()
    current_chapter: str = dspy.InputField()
    context_of_other_chapters: List[str] = dspy.InputField()

    technical_explanation: str = dspy.OutputField(desc="Deep dive into the 'how' and 'why'.")
    key_terms: List[str] = dspy.OutputField(desc="Glossary of essential jargon for this section.")
    mental_model_analogy: str = dspy.OutputField(
        desc="A simple analogy to help the user visualize the concept."
    )


class SocraticQuestionGenerator(dspy.Signature):
    """
    You are a Socratic Mentor. Your goal is to guide learners to the 'crux'
    of a topic by asking provocative, deep questions.
    IMPORTANT: Do NOT provide the answers. Provide questions that challenge
    assumptions and hints that point toward the underlying logic.
    """

    topic: str = dspy.InputField(desc="The core subject to master.")
    context: str = dspy.InputField(desc="The background material or text.")
    user_instructions: Optional[str] = dspy.InputField(desc="Special constraints or focus areas.")
    level: str = dspy.InputField(
        desc="The depth of critical thinking required."
    )
    question_category: str = dspy.InputField(desc="The cognitive framework for the questions.")

    num_questions: int = dspy.InputField(desc="Number of questions to generate.")

    pedagogical_goal: str = dspy.OutputField(desc="The 'Crux' the user needs to realize for themselves.")
    questions_for_discovery: List[Dict[str, str]] = dspy.OutputField(desc="""
        A list of questions. Each includes:
        - 'question_text': The Socratic inquiry.
        - 'cognitive_challenge': What part of the user's brain is this trying to tickle?
        - 'guiding_hint': A nudge or thought experiment (no answers).
    """)


class TopicLearningPath(dspy.Signature):
    """
    You are the 'Curriculum Architect'. Your job is to synthesize the user's past
    knowledge, their current goals, and a new topic into a personalized
    learning session. You must identify the 'Crux' the user needs to master today.
    """

    topic: str = dspy.InputField(desc="The main topic to be learned today.")
    context: str = dspy.InputField(desc="Source material, documents, or raw text for the topic.")
    past_learning: str = dspy.InputField(desc="Summary of what the user already knows or did in previous sessions.")
    user_level: str = dspy.InputField(
        desc="Cognitive level."
    )
    user_hopes: str = dspy.InputField(
        desc="What the user specifically wants to achieve today (e.g., 'I want to be able to code a basic loop')."
    )
    seed: str = dspy.InputField(
        desc="UUID or unique string to vary the pedagogical approach and avoid repetitive paths."
    )
    additional_instructions: Optional[str] = dspy.InputField(
        desc="Any extra constraints like 'keep it brief' or 'use medical analogies'."
    )

    rationale: str = dspy.OutputField(
        desc="Strategic reasoning: How are we connecting past knowledge to today's topic?"
    )
    the_crux: str = dspy.OutputField(desc="The core 'Aha!' moment the user needs to reach today.")
    learning_roadmap: List[Dict[str, str]] = dspy.OutputField(desc="""
        A step-by-step plan for the session:
        - 'phase': (e.g., Bridge, Deep Dive, Challenge)
        - 'description': What will be covered.
        - 'learning_objective': The goal of this phase.
    """)
    suggested_focus: str = dspy.OutputField(desc="A one-sentence 'north star' for the user's session.")


class ExplainerService:
    """Business layer wrapping the DSPy explanation pipelines."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4)

    def generate_explanation(self, data: ExplanationRequest) -> Dict[str, Any]:
        """
        Executes the DSPy signature to generate an explanation.

        Args:
            data (ExplanationRequest): The validated request schema.

        Returns:
            Dict[str, Any]: A dictionary containing the explanation and takeaway.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            response = run_predictor(
                GeneralExplainer,
                self.lm,
                topic=data.topic,
                expertise_level=data.expertise_level,
                context=data.context or "N/A",
            )
            logger.info("Successfully generated explanation for topic: %s", data.topic)
            return {
                "explanation": response.explanation,
                "key_takeaway": response.key_takeaway,
            }
        except Exception as exc:
            logger.error("Error generating explanation for topic %s: %s", data.topic, exc)
            raise GenerationError(str(exc)) from exc

    def generate_tutorial(self, data: TutorialRequest) -> str:
        """
        Generates a Markdown tutorial using DSPy ChainOfThought for logical structuring.

        Args:
            data (TutorialRequest): The validated request schema.

        Returns:
            str: Markdown formatted tutorial content.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            response = run_predictor(
                TopicExplainerString,
                self.lm,
                topic=data.topic,
                expertise_level=data.expertise_level,
                explanation_style=data.explanation_style,
            )
            logger.info("Tutorial generated for: %s", data.topic)
            return response.full_explanation
        except Exception as exc:
            logger.error("DSPy Tutorial Generation Error: %s", exc)
            raise GenerationError(str(exc)) from exc

    def generate_atoz_roadmap(self, data: AtoZRequest) -> Dict[str, Any]:
        """
        Executes the A-to-Z Explainer logic using the thinking model.

        Args:
            data (AtoZRequest): The validated request schema.

        Returns:
            Dict[str, Any]: The structured roadmap data.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            response = run_predictor(
                AtoZExplainer,
                self.lm,
                topic=data.topic,
                expertise_level=data.expertise_level,
                explanation_style=data.explanation_style,
            )
            logger.info("Roadmap generated for: %s", data.topic)
            return {
                "summary": response.summary,
                "knowledge_roadmap": response.knowledge_roadmap,
                "practical_takeaway": response.practical_takeaway,
            }
        except Exception as exc:
            logger.error("Error in A-to-Z roadmap generation: %s", exc)
            raise GenerationError(str(exc)) from exc

    def generate_feynman_explanation(self, data: FeynmanRequest) -> Dict[str, Any]:
        """
        Simplifies complex topics using the Feynman technique.

        Args:
            data (FeynmanRequest): The validated request schema.

        Returns:
            Dict[str, Any]: The explanation, metaphors, and analogy.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            response = run_predictor(
                FeynmanExplainer,
                self.lm,
                complex_topic=data.complex_topic,
                target_age=data.target_age,
            )
            logger.info("Feynman simplification generated for: %s", data.complex_topic)
            return {
                "explanation": response.explanation,
                "key_metaphors": response.key_metaphors,
                "fun_analogy": response.fun_analogy,
            }
        except Exception as exc:
            logger.error("Feynman Service Error: %s", exc)
            raise GenerationError(str(exc)) from exc

    def generate_socratic_questions(self, data: SocraticRequest) -> Dict[str, Any]:
        """
        Generates provocative Socratic questions to guide deep learning.

        Args:
            data (SocraticRequest): Context and category for the session.

        Returns:
            Dict[str, Any]: The pedagogical goal and structured questions.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        try:
            response = run_predictor(
                SocraticQuestionGenerator,
                self.lm,
                topic=data.topic,
                context=data.context,
                user_instructions=data.user_instructions or "None",
                level=data.level,
                question_category=data.question_category,
                num_questions=data.num_questions,
            )
            logger.info("Socratic session generated for topic: %s", data.topic)
            return {
                "pedagogical_goal": response.pedagogical_goal,
                "question_category": data.question_category,
                "questions_for_discovery": response.questions_for_discovery,
            }
        except Exception as exc:
            logger.error("Socratic Service Error: %s", exc)
            raise GenerationError(str(exc)) from exc

    def generate_learning_path(self, data: LearningPathRequest) -> Dict[str, Any]:
        """
        Architects a custom learning curriculum based on user history.

        Args:
            data (LearningPathRequest): The validated request schema.

        Returns:
            Dict[str, Any]: The personalized learning path payload.

        Raises:
            GenerationError: If the DSPy pipeline fails to generate content.
        """
        session_seed = str(uuid.uuid4())
        try:
            response = run_predictor(
                TopicLearningPath,
                self.lm,
                topic=data.topic,
                context=data.context,
                past_learning=data.past_learning,
                user_level=data.user_level,
                user_hopes=data.user_hopes,
                seed=session_seed,
                additional_instructions=data.additional_instructions or "N/A",
            )
            logger.info("Generated learning path for session: %s", session_seed)
            return {
                "session_id": session_seed,
                "rationale": response.rationale,
                "the_crux": response.the_crux,
                "learning_roadmap": response.learning_roadmap,
                "suggested_focus": response.suggested_focus,
            }
        except Exception as exc:
            logger.error("Curriculum Architect Error: %s", exc)
            raise GenerationError(str(exc)) from exc


class OrchestratorService:
    """Business layer orchestrating the streaming A-to-Z journey."""

    def __init__(self) -> None:
        self.lm = build_lm(temperature=0.4)

    async def stream_atoz_journey(self, topic: str, expertise: str) -> AsyncGenerator[str, None]:
        """
        Orchestrates the generation of a full A-to-Z journey and yields JSON
        strings for Server-Sent Events (SSE) consumption.

        Args:
            topic (str): The subject to cover.
            expertise (str): The depth level of the explanation.

        Yields:
            str: JSON-encoded event payloads (plan / chapter / done / error).
        """
        try:
            plan = run_predictor(ExplainerArchitect, self.lm, topic=topic, depth_level=expertise)

            yield json.dumps({
                "event": "plan",
                "data": {
                    "titles": plan.knowledge_graph_outline,
                    "prerequisites": plan.core_prerequisites,
                },
            })

            for index, chapter in enumerate(plan.knowledge_graph_outline):
                logger.info("Streaming Chapter %s: %s", index + 1, chapter)

                detail = run_predictor(
                    SectionExplainer,
                    self.lm,
                    full_topic=topic,
                    current_chapter=chapter,
                    context_of_other_chapters=plan.knowledge_graph_outline,
                )

                yield json.dumps({
                    "event": "chapter",
                    "data": {
                        "index": index + 1,
                        "title": chapter,
                        "content": detail.technical_explanation,
                        "analogy": detail.mental_model_analogy,
                        "jargon": detail.key_terms,
                    },
                })

            yield json.dumps({"event": "done", "data": "Journey complete."})
        except Exception as exc:
            logger.error("Streaming Error: %s", exc)
            yield json.dumps({"event": "error", "data": str(exc)})
