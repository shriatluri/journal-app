import os
import uuid
from typing import Optional
import boto3
from botocore.exceptions import ClientError
from config import Config


class StorageService:
    def __init__(self):
        self.use_s3 = bool(Config.AWS_ACCESS_KEY and Config.AWS_SECRET_KEY)
        if self.use_s3:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=Config.AWS_ACCESS_KEY,
                aws_secret_access_key=Config.AWS_SECRET_KEY,
                region_name=Config.AWS_REGION
            )
            self.bucket = Config.AWS_S3_BUCKET

    def upload_image(self, user_id: str, image_bytes: bytes) -> Optional[str]:
        """Upload image and return URL"""
        if self.use_s3:
            return self._upload_to_s3(user_id, image_bytes)
        else:
            return self._save_locally(user_id, image_bytes)

    def _upload_to_s3(self, user_id: str, image_bytes: bytes) -> str:
        """Upload to AWS S3"""
        file_name = f"{user_id}/{uuid.uuid4()}.jpg"

        try:
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=file_name,
                Body=image_bytes,
                ContentType='image/jpeg'
            )
            return f"s3://{self.bucket}/{file_name}"
        except ClientError as e:
            print(f"S3 upload error: {e}")
            raise

    def _save_locally(self, user_id: str, image_bytes: bytes) -> str:
        """Save locally for development"""
        upload_dir = os.path.join('uploads', user_id)
        os.makedirs(upload_dir, exist_ok=True)

        file_name = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(upload_dir, file_name)

        with open(file_path, 'wb') as f:
            f.write(image_bytes)

        return f"/uploads/{user_id}/{file_name}"

    def delete_image(self, image_url: str) -> bool:
        """Delete image from storage"""
        if not image_url:
            return True

        if image_url.startswith('s3://'):
            return self._delete_from_s3(image_url)
        else:
            return self._delete_locally(image_url)

    def _delete_from_s3(self, s3_url: str) -> bool:
        """Delete from S3"""
        try:
            parts = s3_url.replace('s3://', '').split('/', 1)
            bucket = parts[0]
            key = parts[1]

            self.s3_client.delete_object(Bucket=bucket, Key=key)
            return True
        except ClientError as e:
            print(f"S3 delete error: {e}")
            return False

    def _delete_locally(self, file_path: str) -> bool:
        """Delete local file"""
        try:
            full_path = file_path.lstrip('/')
            if os.path.exists(full_path):
                os.remove(full_path)
            return True
        except Exception as e:
            print(f"Local delete error: {e}")
            return False
