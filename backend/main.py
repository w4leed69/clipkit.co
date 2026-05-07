import os
import uuid
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import yt_dlp

app = FastAPI(title="Social Media Video Downloader")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOADS_DIR = Path("downloads")
DOWNLOADS_DIR.mkdir(exist_ok=True)


class URLRequest(BaseModel):
    url: str


def detect_platform(url: str) -> str:
    url = url.lower()
    if "instagram.com" in url:
        return "Instagram"
    elif "facebook.com" in url or "fb.watch" in url or "fb.com" in url:
        return "Facebook"
    elif "snapchat.com" in url:
        return "Snapchat"
    elif "tiktok.com" in url:
        return "TikTok"
    elif "youtube.com" in url or "youtu.be" in url:
        return "YouTube"
    elif "twitter.com" in url or "x.com" in url:
        return "Twitter/X"
    return "Unknown"


def is_private_error(error_msg: str) -> bool:
    private_keywords = [
        "private", "login required", "not logged in", "authentication",
        "requires login", "protected", "unavailable", "forbidden", "403",
        "this content is not available", "account is private"
    ]
    error_lower = error_msg.lower()
    return any(kw in error_lower for kw in private_keywords)


@app.get("/")
def root():
    return {"status": "running", "message": "Social Media Video Downloader API"}


@app.post("/api/info")
async def get_video_info(request: URLRequest):
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
        "skip_download": True,
    }

    try:
        loop = asyncio.get_event_loop()

        def fetch_info():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(request.url, download=False)

        info = await loop.run_in_executor(None, fetch_info)

        if not info:
            raise HTTPException(status_code=404, detail="Could not fetch video info")

        formats = []
        seen = set()
        for f in info.get("formats", []):
            if f.get("vcodec") != "none" and f.get("ext") in ("mp4", "webm"):
                quality = f.get("height")
                if quality and quality not in seen:
                    seen.add(quality)
                    formats.append({
                        "format_id": f["format_id"],
                        "quality": f"{quality}p",
                        "ext": f.get("ext", "mp4"),
                        "filesize": f.get("filesize") or f.get("filesize_approx"),
                    })

        formats.sort(key=lambda x: int(x["quality"].replace("p", "")), reverse=True)

        if not formats:
            formats = [{"format_id": "best", "quality": "Best Available", "ext": "mp4", "filesize": None}]

        return {
            "title": info.get("title", "Video"),
            "thumbnail": info.get("thumbnail"),
            "duration": info.get("duration"),
            "platform": detect_platform(request.url),
            "uploader": info.get("uploader") or info.get("channel"),
            "formats": formats,
        }

    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        if is_private_error(error_msg):
            raise HTTPException(
                status_code=403,
                detail="This content is from a private account or requires login. Only public videos can be downloaded."
            )
        raise HTTPException(status_code=400, detail=f"Could not fetch video: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/download")
async def download_video(request: URLRequest, format_id: str = "best"):
    file_id = str(uuid.uuid4())
    output_path = DOWNLOADS_DIR / f"{file_id}.%(ext)s"

    ydl_opts = {
        "format": f"{format_id}+bestaudio/best" if format_id != "best" else "bestvideo+bestaudio/best",
        "outtmpl": str(output_path),
        "quiet": True,
        "no_warnings": True,
        "merge_output_format": "mp4",
    }

    try:
        loop = asyncio.get_event_loop()

        def do_download():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([request.url])

        await loop.run_in_executor(None, do_download)

        downloaded = list(DOWNLOADS_DIR.glob(f"{file_id}.*"))
        if not downloaded:
            raise HTTPException(status_code=500, detail="Download failed — file not found")

        file_path = downloaded[0]
        return {"file_id": file_id, "filename": file_path.name, "download_url": f"/api/file/{file_path.name}"}

    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        if is_private_error(error_msg):
            raise HTTPException(
                status_code=403,
                detail="This content is from a private account or requires login. Only public videos can be downloaded."
            )
        raise HTTPException(status_code=400, detail=f"Download failed: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/file/{filename}")
async def serve_file(filename: str):
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_path = DOWNLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
