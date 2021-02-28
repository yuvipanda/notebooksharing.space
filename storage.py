"""
Storage backends for ipynb.pub
"""
import shutil
import os
import gzip
import aioboto3


class StorageBackend:
    async def put(self, name: str, path: str):
        pass

    async def get(self, name: str) -> str:
        pass


class FileBackend(StorageBackend):
    def __init__(self):
        self.data_path = os.environ.get('DATA_DIR', os.getcwd())


    def path_for_name(self, name: str) -> str:
        return os.path.join(self.data_path, name)

    async def put(self, name: str, data: bytes):
        with gzip.open(self.path_for_name(name), 'w') as f:
            f.write(data)

    async def get(self, name: str) -> bytes:
        with gzip.open(self.path_for_name(name)) as f:
            return f.read()


class S3Backend(StorageBackend):
    def __init__(self):
        self.endpoint_url = os.environ.get('AWS_S3_ENDPOINT_URL')
        self.bucket = os.environ['AWS_S3_BUCKET']

    def path_for_name(self, name: str) -> str:
        return f'notebooks/{name}'

    async def put(self, name: str, data: bytes):
        async with aioboto3.client('s3', endpoint_url=self.endpoint_url) as s3:
            await s3.put_object(
                Key=self.path_for_name(name),
                Bucket=self.bucket,
                Body=gzip.compress(data)
            )


    async def get(self, name: str):
        async with aioboto3.client('s3', endpoint_url=self.endpoint_url) as s3:
            gzip_response = await (await s3.get_object(
                Key=self.path_for_name(name),
                Bucket=self.bucket,
            ))['Body'].read()
            return gzip.decompress(gzip_response)
