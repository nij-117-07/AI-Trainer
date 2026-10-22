from fastapi import APIRouter
from learning.explainer.router import router as explainer_router
from learning.guides.router import router as guides_router
from learning.memory_helper.router import router as memory_helper_router
from learning.motivation.router import router as motivation_router
from learning.projects.router import router as projects_router
from learning.roadmap.router import router as roadmap_router
from learning.resource_suggestor.router import router as resource_suggestor_router
from learning.roleplay_chatbot.router import router as roleplay_chatbot_router
from learning.skill_architect.router import router as skill_architect_router
from learning.tutor.router import router as tutor_router
from learning.tutor_chat.router import router as tutor_chat_router

learning_router = APIRouter(prefix="/learning")
learning_router.include_router(explainer_router)
learning_router.include_router(roadmap_router)
learning_router.include_router(tutor_router)
learning_router.include_router(tutor_chat_router)
learning_router.include_router(motivation_router)
learning_router.include_router(memory_helper_router)
learning_router.include_router(guides_router)
learning_router.include_router(projects_router)
learning_router.include_router(skill_architect_router)
learning_router.include_router(roleplay_chatbot_router)
learning_router.include_router(resource_suggestor_router)

__all__ = ["learning_router"]
