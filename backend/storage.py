import os
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
import logging

logger = logging.getLogger(__name__)

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
# E.g. https://pub-xxxxxxxxxxxxx.r2.dev
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")

def get_r2_client():
    if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME]):
        return None
        
    return boto3.client(
        's3',
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4', retries={'max_attempts': 3})
    )

def upload_file_to_r2(file_path: str, object_name: str) -> str:
    """
    Uploads a file to Cloudflare R2 and returns the public URL.
    Raises Exception if upload fails.
    """
    s3_client = get_r2_client()
    if not s3_client:
        raise Exception("Cloudflare R2 is not configured. Missing environment variables.")
        
    content_type = "application/octet-stream"
    if file_path.lower().endswith('.apk'):
        content_type = "application/vnd.android.package-archive"
    elif file_path.lower().endswith('.zip'):
        content_type = "application/zip"
        
    try:
        # Use upload_file which handles large files via multipart uploads automatically
        s3_client.upload_file(
            file_path,
            R2_BUCKET_NAME,
            object_name,
            ExtraArgs={'ContentType': content_type}
        )
        
        if R2_PUBLIC_URL:
            base_url = R2_PUBLIC_URL.rstrip('/')
            return f"{base_url}/{object_name}"
        else:
            logger.warning("R2_PUBLIC_URL is not set. Returning a placeholder URL. Please configure it in your environment.")
            return f"https://your-r2-public-domain.r2.dev/{object_name}"
    except ClientError as e:
        logger.error(f"S3 ClientError: {e}")
        raise Exception(f"Failed to upload to R2: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected upload error: {e}")
        raise Exception(f"Unexpected error during R2 upload: {str(e)}")
