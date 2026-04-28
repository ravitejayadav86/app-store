"""
PandaStore Storage Layer
========================
• Music / Images  → Cloudinary (CDN, permanent, free 25GB)
• Large files (APK, games, etc.) → Cloudinary chunked upload (supports up to several GB)

All uploads are permanent – Cloudinary never auto-deletes files.
"""

import os
import uuid
import tempfile
import cloudinary
import cloudinary.uploader
import cloudinary.utils

# ── Configure Cloudinary from environment ─────────────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

# Chunk size for large uploads: 100 MB
_CHUNK_SIZE = 100 * 1024 * 1024


def _resource_type(content_type: str) -> str:
    """Map MIME type → Cloudinary resource_type."""
    if content_type.startswith("audio"):
        return "video"   # Cloudinary stores audio under 'video'
    if content_type.startswith("image"):
        return "image"
    if content_type.startswith("video"):
        return "video"
    return "raw"          # APK, ZIP, EXE, PDF, etc.


def _public_id(folder: str, filename: str) -> str:
    """Generate a unique public_id under the given folder."""
    return f"{folder}/{uuid.uuid4()}_{filename}"


def upload_music_to_gcp(file_obj, filename: str, content_type: str = "audio/mpeg") -> str:
    """
    Upload an audio file to Cloudinary under the 'music/' folder.
    Uses chunked upload so large lossless files (FLAC, WAV) are also supported.
    """
    return _upload_with_chunking(
        file_obj,
        filename=filename,
        content_type=content_type,
        folder="music",
        resource_type="video",
    )


def upload_file(file_obj, filename: str, content_type: str = "application/octet-stream") -> str:
    """
    Upload any file (APK, game, image, book, etc.) to Cloudinary.
    Automatically picks the right resource_type and uses chunked upload
    for files larger than 100 MB.
    """
    rtype = _resource_type(content_type)
    folder = _folder_from_type(content_type)
    return _upload_with_chunking(
        file_obj,
        filename=filename,
        content_type=content_type,
        folder=folder,
        resource_type=rtype,
    )


def _folder_from_type(content_type: str) -> str:
    """Organise uploads into logical Cloudinary folders by type."""
    if content_type.startswith("audio"):
        return "music"
    if content_type.startswith("image"):
        return "icons"
    if content_type.startswith("video"):
        return "videos"
    return "apps"


def _upload_with_chunking(file_obj, filename: str, content_type: str,
                           folder: str, resource_type: str) -> str:
    """
    Core upload helper.
    • For files that fit in memory as a stream, write to a temp file so we can
      use upload_large() which handles arbitrarily large files.
    • Returns the permanent secure_url.
    """
    public_id = _public_id(folder, filename)

    # Write the incoming stream to a NamedTemporaryFile so Cloudinary can
    # seek it (required for chunked upload).
    suffix = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        chunk = file_obj.read(_CHUNK_SIZE)
        while chunk:
            tmp.write(chunk)
            chunk = file_obj.read(_CHUNK_SIZE)

    try:
        result = cloudinary.uploader.upload_large(
            tmp_path,
            public_id=public_id,
            resource_type=resource_type,
            chunk_size=_CHUNK_SIZE,
            overwrite=False,
        )
        return result.get("secure_url", "")
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


# ── Delete ─────────────────────────────────────────────────────────────────
def delete_file(file_url: str):
    """Delete a file from Cloudinary given its secure_url."""
    try:
        # URL pattern: https://res.cloudinary.com/<cloud>/<resource_type>/upload/v.../public_id.ext
        if "cloudinary.com" not in file_url:
            return

        parts = file_url.split("/upload/", 1)
        if len(parts) < 2:
            return

        path_after_upload = parts[1]  # e.g. "v1234567890/music/uuid_song.mp3"
        # Strip optional version prefix
        segments = path_after_upload.split("/")
        if segments and segments[0].startswith("v") and segments[0][1:].isdigit():
            segments = segments[1:]

        # Remove file extension for non-raw types
        public_id_with_ext = "/".join(segments)
        dot_idx = public_id_with_ext.rfind(".")
        public_id = public_id_with_ext[:dot_idx] if dot_idx != -1 else public_id_with_ext

        # Determine resource_type from URL
        if "/video/" in file_url:
            rtype = "video"
        elif "/image/" in file_url:
            rtype = "image"
        else:
            rtype = "raw"

        cloudinary.uploader.destroy(public_id, resource_type=rtype)
        print(f"Deleted from Cloudinary: {public_id}")
    except Exception as e:
        print(f"Failed to delete file from Cloudinary: {e}")


# ── Presigned / download URL ──────────────────────────────────────────────
def generate_download_url(file_url: str, expires_in: int = 3600) -> str:
    """
    For Cloudinary, all URLs are already publicly accessible.
    For raw (APK, ZIP) files we generate a signed URL that forces a download.
    """
    try:
        if "cloudinary.com" not in file_url:
            return file_url

        if "/raw/" in file_url:
            # Generate a short-lived signed URL for raw binary downloads
            parts = file_url.split("/upload/", 1)
            if len(parts) == 2:
                path = parts[1]
                segments = path.split("/")
                if segments and segments[0].startswith("v") and segments[0][1:].isdigit():
                    segments = segments[1:]
                public_id = "/".join(segments)

                signed = cloudinary.utils.cloudinary_url(
                    public_id,
                    resource_type="raw",
                    sign_url=True,
                    expires_at=int(__import__("time").time()) + expires_in,
                    attachment=True,   # forces browser download
                )[0]
                return signed

        return file_url   # Image/audio URLs are public by default
    except Exception as e:
        print(f"Failed to generate download URL: {e}")
        return file_url
