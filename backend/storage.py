import os, uuid
import cloudinary
import cloudinary.uploader

# --- Configure Cloudinary from environment ---
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

def _get_resource_type(content_type: str) -> str:
    """Determine Cloudinary resource_type from MIME type."""
    if content_type and content_type.startswith('audio'):
        return 'video'  # Cloudinary uses 'video' for audio files
    if content_type and content_type.startswith('image'):
        return 'image'
    return 'raw'  # APKs, ZIPs, etc.

def upload_music_to_gcp(file_obj, filename, content_type='audio/mpeg'):
    """Upload music files to Cloudinary under the 'music' folder."""
    try:
        unique_name = f"music/{uuid.uuid4()}_{filename}"
        result = cloudinary.uploader.upload(
            file_obj,
            public_id=unique_name,
            resource_type='video',  # Cloudinary uses 'video' for audio
            overwrite=False
        )
        return result.get('secure_url', '')
    except Exception as e:
        print(f"Cloudinary music upload error: {e}")
        raise

def upload_file(file_obj, filename, content_type='application/octet-stream'):
    """Upload any file to Cloudinary."""
    try:
        unique_name = f"uploads/{uuid.uuid4()}_{filename}"
        resource_type = _get_resource_type(content_type)
        result = cloudinary.uploader.upload(
            file_obj,
            public_id=unique_name,
            resource_type=resource_type,
            overwrite=False
        )
        return result.get('secure_url', '')
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        raise

def delete_file(file_url: str):
    """Delete a file from Cloudinary using its URL."""
    try:
        # Extract public_id from the URL
        # URL format: https://res.cloudinary.com/<cloud>/image/upload/v.../uploads/<uuid>_<filename>
        parts = file_url.split('/upload/')
        if len(parts) < 2:
            return
        public_id_with_version = parts[1]
        # Strip version prefix like v1234567890/
        segments = public_id_with_version.split('/')
        if segments[0].startswith('v') and segments[0][1:].isdigit():
            segments = segments[1:]
        # Strip file extension for non-raw types
        public_id = '/'.join(segments)
        dot_idx = public_id.rfind('.')
        if dot_idx != -1:
            public_id = public_id[:dot_idx]

        # Determine resource type from URL
        if '/video/' in file_url:
            resource_type = 'video'
        elif '/image/' in file_url:
            resource_type = 'image'
        else:
            resource_type = 'raw'

        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
    except Exception as e:
        print(f'Failed to delete file from Cloudinary: {e}')

def generate_download_url(file_url: str, expires_in=3600) -> str:
    """Cloudinary URLs are already public; return as-is."""
    return file_url
