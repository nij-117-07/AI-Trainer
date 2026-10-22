from fastapi import APIRouter

from tools.ai_detector.router import router as ai_detector_router
from tools.charts.router import router as charts_router
from tools.creative_assets.router import router as creative_assets_router
from tools.diagram.router import router as diagram_router
from tools.flexible_writer.router import router as flexible_writer_router
from tools.ingredients.router import router as ingredients_router
from tools.prompt_generator.router import router as prompt_generator_router
from tools.social_posts.router import router as social_posts_router
from tools.vision_converter.router import router as vision_converter_router

tools_router = APIRouter(prefix="/tools")
tools_router.include_router(ai_detector_router)
tools_router.include_router(charts_router)
tools_router.include_router(creative_assets_router)
tools_router.include_router(diagram_router)
tools_router.include_router(flexible_writer_router)
tools_router.include_router(ingredients_router)
tools_router.include_router(prompt_generator_router)
tools_router.include_router(social_posts_router)
tools_router.include_router(vision_converter_router)

__all__ = ["tools_router"]
