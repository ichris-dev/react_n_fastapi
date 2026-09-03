from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from app.api.fetch import app as app_router
from app.db.database_connection import connect, disconnect

@asynccontextmanager
async def lifespan(app: FastAPI):

    # Application startup
    await connect()

    yield

    # Application shutdown
    await disconnect()


def get_application() -> FastAPI:

    application = FastAPI(
        lifespan=lifespan
    )
    
    application.add_middleware(
        CORSMiddleware,

        allow_origins=[
            "http://localhost:5173"
        ],

        allow_credentials=True,

        allow_methods=["*"],

        allow_headers=["*"],
    )

    application.include_router(app_router)

    return application


app = get_application()