import logging
from typing import Any, Dict, Optional, Type

import dspy

from core.config import master_llm_config, settings

logger = logging.getLogger(__name__)


def build_lm(**overrides: Any) -> dspy.LM:
    """
    Constructs a dspy.LM instance from the shared LLM configuration.

    Args:
        **overrides: Optional keyword arguments merged over the shared config
            (e.g. temperature, cache, stop). Overrides win over the defaults.

    Returns:
        dspy.LM: A configured language model ready for dspy.context.

    Raises:
        KeyError: If the shared config is missing a required LLM field.
    """
    cfg: Dict[str, Any] = {**master_llm_config, **overrides}
    logger.debug(
        "Building dspy.LM for model=%s api_base=%s",
        cfg["model_name"],
        cfg["api_base"],
    )
    extra_kwargs: Dict[str, Any] = {
        key: value
        for key, value in cfg.items()
        if key not in ("model_name", "api_key", "api_base", "temperature")
    }
    return dspy.LM(
        model=f"openai/{cfg['model_name']}",
        api_key=cfg["api_key"],
        api_base=cfg["api_base"],
        temperature=cfg.get("temperature", 0.7),
        **extra_kwargs,
    )


def supports_native_cot() -> bool:
    """
    Reports whether the configured LLM natively performs chain-of-thought
    reasoning.

    Returns:
        bool: True when settings.MODEL_NATIVE_COT is enabled.
    """
    return bool(settings.MODEL_NATIVE_COT)


def get_predictor(signature: Type[dspy.Signature]):
    """
    Returns the appropriate DSPy predictor for a signature.

    The ChainOfThought wrapper is applied unless the configured LLM is a
    native reasoning model (settings.MODEL_NATIVE_COT), in which case plain
    Predict is used.

    Args:
        signature: The DSPy signature class to wrap.

    Returns:
        dspy.Predict or dspy.ChainOfThought: An instantiated predictor.
    """
    if supports_native_cot():
        logger.debug("Using dspy.Predict for %s", signature.__name__)
        return dspy.Predict(signature)
    logger.debug("Using dspy.ChainOfThought for %s", signature.__name__)
    return dspy.ChainOfThought(signature)


def run_predictor(
    signature: Type[dspy.Signature],
    lm: dspy.LM,
    **kwargs: Any,
) -> dspy.Prediction:
    """
    Runs a DSPy predictor for a signature within the given LM context.

    Args:
        signature: The DSPy signature class to execute.
        lm: The language model bound for this call.
        **kwargs: Input fields for the signature.

    Returns:
        dspy.Prediction: The raw prediction produced by the predictor.
    """
    with dspy.context(lm=lm):
        return get_predictor(signature)(**kwargs)
