import boto3, os, uuid
from botocore.client import Config
try:
    from google.cloud import storage as gcp_storage
except ImportError:
    gcp_storage = None

# --- Existing Backblaze B2 Variables ---
B2_KEY_ID = os.getenv('B2_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')
B2_ENDPOINT = os.getenv('B2_ENDPOINT')

# --- New Google Cloud Variables ---
GCP_MUSIC_BUCKET = os.getenv('GCP_MUSIC_BUCKET') # e.g., 'pandastore-music'

def get_s3_client():
    return boto3.client('s3', endpoint_url='https://'+B2_ENDPOINT, aws_access_key_id=B2_KEY_ID, aws_secret_access_key=B2_APPLICATION_KEY, config=Config(signature_version='s3v4'))

def upload_music_to_gcp(file_obj, filename, content_type='audio/mpeg'):
    """Uploads ONLY music files to Google Cloud Storage. Fallbacks to B2 if not configured."""
    if not GCP_MUSIC_BUCKET or not gcp_storage:
        print("GCP not fully configured, falling back to B2 for music upload.")
        return upload_file(file_obj, filename, content_type)
        
    client = gcp_storage.Client()
    bucket = client.bucket(GCP_MUSIC_BUCKET)
    unique_name = f"music/{uuid.uuid4()}_{filename}"
    blob = bucket.blob(unique_name)
    blob.upload_from_file(file_obj, content_type=content_type)
    return f"https://storage.googleapis.com/{GCP_MUSIC_BUCKET}/{unique_name}"

def upload_file(file_obj, filename, content_type='application/octet-stream'):
    s3 = get_s3_client()
    unique_name = str(uuid.uuid4()) + '_' + filename
    s3.upload_fileobj(file_obj, B2_BUCKET_NAME, unique_name, ExtraArgs={'ContentType': content_type})
    return 'https://' + B2_ENDPOINT + '/' + B2_BUCKET_NAME + '/' + unique_name

def delete_file(file_url):
    try:
        s3 = get_s3_client()
        key = file_url.split(B2_BUCKET_NAME + '/')[-1]
        s3.delete_object(Bucket=B2_BUCKET_NAME, Key=key)
    except Exception as e:
        print('Failed to delete file: ' + str(e))

def generate_download_url(file_url, expires_in=3600):
    try:
        s3 = get_s3_client()
        key = file_url.split(B2_BUCKET_NAME + '/')[-1]
        return s3.generate_presigned_url('get_object', Params={'Bucket': B2_BUCKET_NAME, 'Key': key}, ExpiresIn=expires_in)
    except Exception as e:
        print('Failed to generate URL: ' + str(e))
        return file_url
