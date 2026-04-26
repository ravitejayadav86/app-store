import boto3, os, uuid
from botocore.client import Config

B2_KEY_ID = os.getenv('B2_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')
B2_ENDPOINT = os.getenv('B2_ENDPOINT')

def get_s3_client():
    return boto3.client('s3', endpoint_url='https://'+B2_ENDPOINT, aws_access_key_id=B2_KEY_ID, aws_secret_access_key=B2_APPLICATION_KEY, config=Config(signature_version='s3v4'))

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
