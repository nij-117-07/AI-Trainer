from fastapi import APIRouter
from practice.battleground.router import router as battleground_router
from practice.bias_inoculator.router import router as bias_inoculator_router
from practice.clarity_trainer.router import router as clarity_trainer_router
from practice.conceptual_bridge.router import router as conceptual_bridge_router
from practice.debate.router import router as debate_router
from practice.executive_eq.router import router as executive_eq_router
from practice.foresight_trainer.router import router as foresight_trainer_router
from practice.guess_game.router import router as guess_game_router
from practice.interview.router import router as interview_router
from practice.joke_coach.router import router as joke_coach_router
from practice.negotiation.router import router as negotiation_router
from practice.observation_trainer.router import router as observation_trainer_router
from practice.puzzle.router import router as puzzle_router
from practice.riddle.router import router as riddle_router
from practice.socratic.router import router as socratic_router
from practice.testing_portal.router import router as testing_portal_router

practice_router = APIRouter(prefix="/practice")
practice_router.include_router(battleground_router)
practice_router.include_router(bias_inoculator_router)
practice_router.include_router(clarity_trainer_router)
practice_router.include_router(conceptual_bridge_router)
practice_router.include_router(debate_router)
practice_router.include_router(executive_eq_router)
practice_router.include_router(foresight_trainer_router)
practice_router.include_router(guess_game_router)
practice_router.include_router(interview_router)
practice_router.include_router(joke_coach_router)
practice_router.include_router(negotiation_router)
practice_router.include_router(observation_trainer_router)
practice_router.include_router(puzzle_router)
practice_router.include_router(riddle_router)
practice_router.include_router(socratic_router)
practice_router.include_router(testing_portal_router)

__all__ = ["practice_router"]
