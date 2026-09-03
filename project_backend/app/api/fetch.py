from fastapi import APIRouter, HTTPException, UploadFile,  File, Form
from app.db.database_connection import get_pool
from pydantic import BaseModel
from pathlib import Path
from fastapi.responses import FileResponse

app = APIRouter()


@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"id": user_id}


@app.get("/files")
async def get_files(browser_id: str):

    pool = await get_pool()

    async with pool.acquire() as conn:

        files = await conn.fetch(
            """
            SELECT *
            FROM files
            WHERE sender_id = $1
               OR receiver_id = $1
            ORDER BY created_at DESC
            """,
            browser_id
        )

    return {
        "files": [dict(file) for file in files]
    }
    


UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


@app.post("/save")
async def save_files(
    browser_id: str = Form(...),
    file_code: str = Form(...),
    file_status: str = Form(...),
    files: list[UploadFile] = File(...)
):

    pool = await get_pool()

    saved_files = []

    async with pool.acquire() as conn:

        for file in files:

            file_path = UPLOAD_DIR / file.filename  # type: ignore

            with open(file_path, "wb") as buffer:

                while chunk := await file.read(1024 * 1024):
                    buffer.write(chunk)

            file_extension = Path(
                file.filename  # type: ignore
            ).suffix.lstrip(".")

            result = await conn.fetchrow(
                """
                INSERT INTO files(
                    browser_id,
                    file_code,
                    file_status,
                    file_name,
                    file_extension,
                    sender_id
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
                """,
                browser_id,
                file_code,
                file_status,
                file.filename,
                file_extension,
                browser_id
            )

            saved_files.append(dict(result))

    return {
        "message": "Files saved successfully",
        "browser_id": browser_id,
        "files": saved_files
    }

@app.get("/download/{file_code}")
async def download_file(
    file_code: str,
    browser_id: str
):

    pool = await get_pool()

    async with pool.acquire() as conn:

        file = await conn.fetchrow(
            """
            SELECT *
            FROM files
            WHERE file_code = $1
            LIMIT 1
            """,
            file_code
        )

        if file is None:
            raise HTTPException(
                status_code=404,
                detail="File code not found"
            )

        file = dict(file)

        # Sender cannot receive their own file
        if file["sender_id"] == browser_id:
            raise HTTPException(
                status_code=400,
                detail="You cannot download your own file"
            )

        file_name = file["file_name"]

        file_path = UPLOAD_DIR / file_name

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="File not found on server"
            )

        # Update database
        await conn.execute(
            """
            UPDATE files
            SET
                file_status = 'received',
                receiver_id = $1
            WHERE file_code = $2
            """,
            browser_id,
            file_code
        )

    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type="application/octet-stream"
    )