import asyncpg
from app.db.config import settings
import logging


pool: asyncpg.Pool | None = None


logging.basicConfig(level=logging.INFO)



async def connect():
    
    global pool
    
    pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL,
        min_size=5,
        max_size=20   
    )
    
    logging.info("Database connection established successfully")
    

async def disconnect():
    
    global pool
    
    if pool:
        await pool.close()
        
        logging.info("Database disconnect")


async def get_pool() -> asyncpg.Pool:
    
    global pool
    
    if pool is None:
        raise RuntimeError("Database Pool is not initilized yet")
    
    return pool