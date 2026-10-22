import os
import logging

logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    load_dotenv()
    logger.debug("Loaded .env file via python-dotenv")
except ImportError:
    logger.debug("python-dotenv not installed; relying on os.getenv defaults")


class Settings:
    # LLM Configuration
    LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_API_BASE: str = os.getenv("LLM_API_BASE", "https://api.openai.com/v1")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.7"))

    # DSPy Reasoning Configuration
    # When true, the underlying LLM natively performs chain-of-thought
    # reasoning, so the DSPy ChainOfThought wrapper is skipped in favor of
    # plain Predict.
    MODEL_NATIVE_COT: bool = os.getenv("MODEL_NATIVE_COT", "false").lower() in ("true", "1", "yes")

    # API Tracing Configuration
    API_TRACE_ENABLED: bool = os.getenv("API_TRACE_ENABLED", "false").lower() in ("true", "1", "yes")

    # API Security Configuration
    API_KEY: str = os.getenv("API_KEY", "")

    # Performance Grader Configuration
    GRADER_STORAGE_DIR: str = os.getenv("GRADER_STORAGE_DIR", "Data/Grader")

    # Adaptive Tutor Configuration
    TUTOR_PROMPTS_DIR: str = os.getenv("TUTOR_PROMPTS_DIR", "")

    # Linguistic Module Storage Configuration
    ROLEPLAY_STORAGE_DIR: str = os.getenv("ROLEPLAY_STORAGE_DIR", "Data/Linguistic/Roleplays")
    SIMULATOR_PROMPTS_FILE: str = os.getenv("SIMULATOR_PROMPTS_FILE", "Data/Linguistic/Simulator/prompts.yaml")

    # Ingredients Analyzer Configuration
    INGREDIENTS_STORAGE_DIR: str = os.getenv("INGREDIENTS_STORAGE_DIR", "Data/Ingredients")

    # Testing Portal Configuration
    PAST_QUESTIONS_LIMIT: int = int(os.getenv("PAST_QUESTIONS_LIMIT", "5"))

    # Vision Converter Configuration
    VISION_STORAGE_DIR: str = os.getenv("VISION_STORAGE_DIR", "Data/VisionConverter")

    # App Configuration
    APP_NAME: str = os.getenv("APP_NAME", "AI Learning Platform")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG" if os.getenv("DEBUG", "false").lower() in ("true", "1", "yes") else "INFO").upper()
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    


settings = Settings()

master_llm_config = {
    "model_name": settings.LLM_MODEL_NAME,
    "api_key": settings.LLM_API_KEY,
    "api_base": settings.LLM_API_BASE,
    "temperature": settings.LLM_TEMPERATURE,
}
