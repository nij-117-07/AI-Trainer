from fastapi import APIRouter

from swe.code_writer.router import router as code_writer_router
from swe.command_line.router import router as command_line_router
from swe.system_design.router import router as system_design_router

swe_router = APIRouter(prefix="/swe")
swe_router.include_router(code_writer_router)
swe_router.include_router(command_line_router)
swe_router.include_router(system_design_router)

__all__ = ["swe_router"]
