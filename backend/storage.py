import boto3
import os
import uuid
from botocore.client import Config

B2_KEY_ID = os.getenv("B2_KEY_ID")
B2_APPLICATION_KEY = os.getenv("B2_APPLICATION_KEY")
B2_BUCKET_NAME = os.getenv("B2_BUCKET_NAME")
B2_ENDPOINT = os.getenv("B2_ENDPOINT")

def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{B2_ENDPOINT}",
        aws_access_key_id=B2_KEY_ID,
        aws_secret_access_key=B2_APPLICATION_KEY,
        config=Config(signature_version="s3v4")
    )

def upload_file(file_obj, filename: str, content_type: str = "application/octet-stream") -> str:
    s3 = get_s3_client()
    unique_name = f"{uuid.uuid4()}_{filename}"
    s3.upload_fileobj(
        file_obj,
        B2_BUCKET_NAME,
        unique_name,
        ExtraArgs={"ContentType": content_type}
    )
    return f"https://{B2_ENDPOINT}/{B2_BUCKET_NAME}/{unique_name}"

def delete_file(file_url: str):
    try:
        s3 = get_s3_client()
        key = file_url.split(f"{B2_BUCKET_NAME}/")[-1]
        s3.delete_object(Bucket=B2_BUCKET_NAME, Key=key)
    except Exception as e:
        print(f"Failed to delete file: {e}")

def generate_download_url(file_url: str, expires_in: int = 3600) -> str:
    try:
        s3 = get_s3_client()
        key = file_url.split(f"{B2_BUCKET_NAME}/")[-1]
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": B2_BUCKET_NAME, "Key": key},
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        print(f"Failed to generate URL: {e}")
        return file_url
