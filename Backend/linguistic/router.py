from fastapi import APIRouter
from linguistic.idioms.router import router as idioms_router
from linguistic.language_tester.router import router as language_tester_router
from linguistic.lesson.router import router as lesson_router
from linguistic.poet_engine.router import router as poet_engine_router
from linguistic.rewriter.router import router as rewriter_router
from linguistic.roleplay_module.router import router as roleplay_module_router
from linguistic.sentence_of_the_day.router import router as sentence_of_the_day_router
from linguistic.simulator.router import router as simulator_router
from linguistic.translator.router import router as translator_router
from linguistic.word_of_the_day.router import router as word_of_the_day_router

linguistic_router = APIRouter(prefix="/linguistic")
linguistic_router.include_router(word_of_the_day_router)
linguistic_router.include_router(translator_router)
linguistic_router.include_router(rewriter_router)
linguistic_router.include_router(sentence_of_the_day_router)
linguistic_router.include_router(poet_engine_router)
linguistic_router.include_router(idioms_router)
linguistic_router.include_router(language_tester_router)
linguistic_router.include_router(roleplay_module_router)
linguistic_router.include_router(lesson_router)
linguistic_router.include_router(simulator_router)

__all__ = ["linguistic_router"]
