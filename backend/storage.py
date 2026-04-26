import os
import json
import logging
from datetime import timedelta
import firebase_admin
from firebase_admin import credentials, storage

logger = logging.getLogger(__name__)

FIREBASE_BUCKET_NAME = os.getenv("FIREBASE_BUCKET_NAME")
# Support loading from a secret file (Render) or a JSON string directly
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON")

_firebase_app = None

def get_firebase_app():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    if not FIREBASE_BUCKET_NAME:
        return None

    try:
        cred = None
        if FIREBASE_CREDENTIALS_JSON:
            cred_dict = json.loads(FIREBASE_CREDENTIALS_JSON)
            cred = credentials.Certificate(cred_dict)
        elif os.path.exists(FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        else:
            logger.warning("Firebase credentials not found.")
            return None

        _firebase_app = firebase_admin.initialize_app(cred, {
            'storageBucket': FIREBASE_BUCKET_NAME
        })
        return _firebase_app
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return None

def upload_file_to_firebase(file_path: str, object_name: str) -> str:
    """
    Uploads a file to Firebase Storage and returns the public download URL.
    """
    if not get_firebase_app():
        raise Exception("Firebase is not configured.")

    try:
        bucket = storage.bucket()
        blob = bucket.blob(object_name)

        content_type = "application/octet-stream"
        if file_path.lower().endswith('.apk'):
            content_type = "application/vnd.android.package-archive"
        elif file_path.lower().endswith('.zip'):
            content_type = "application/zip"

        logger.info(f"Uploading {file_path} to Firebase Storage as {object_name}...")
        blob.upload_from_filename(file_path, content_type=content_type)
        
        # Make the blob publicly accessible
        blob.make_public()
        
        return blob.public_url

    except Exception as e:
        logger.error(f"Unexpected upload error: {e}")
        raise Exception(f"Unexpected error during Firebase upload: {str(e)}")
