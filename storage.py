"""
Storage backends for ipynb.pub
"""
import asyncio
import aiohttp
import tempfile
import shutil
import os
import gzip
import aioboto3
from yarl import URL
import hashlib
import BaseEmoji

anybase = BaseEmoji.anybase()


def sha256(data: bytes):
    digester = hashlib.sha256()
    digester.update(data)
    return anybase.encode(digester.digest())


class StorageBackend:
    async def put(self, name: str, path: str):
        pass

    async def get(self, name: str) -> str:
        pass


class FileBackend(StorageBackend):
    def __init__(self):
        self.data_path = os.environ.get("DATA_DIR", os.getcwd())

    def path_for_name(self, name: str) -> str:
        return os.path.join(self.data_path, name)

    async def put(self, data: bytes):
        name = sha256(data)
        with gzip.open(self.path_for_name(name), "w") as f:
            f.write(data)
        return name

    async def get(self, name: str) -> bytes:
        with gzip.open(self.path_for_name(name)) as f:
            return f.read()


class S3Backend(StorageBackend):
    def __init__(self):
        self.endpoint_url = os.environ.get("AWS_S3_ENDPOINT_URL")
        self.bucket = os.environ["AWS_S3_BUCKET"]

    def path_for_name(self, name: str) -> str:
        return f"notebooks/{name}"

    async def put(self, data: bytes):
        name = sha256(data)
        async with aioboto3.client("s3", endpoint_url=self.endpoint_url) as s3:
            await s3.put_object(
                Key=self.path_for_name(name),
                Bucket=self.bucket,
                Body=gzip.compress(data),
            )
        return name

    async def get(self, name: str):
        async with aioboto3.client("s3", endpoint_url=self.endpoint_url) as s3:

            try:
                gzip_response = await (
                    await s3.get_object(
                        Key=self.path_for_name(name),
                        Bucket=self.bucket,
                    )
                )["Body"].read()
            except s3.exceptions.NoSuchKey:
                return None
            return gzip.decompress(gzip_response)


class IPFSBackend(StorageBackend):
    def __init__(self, daemon_url="http://localhost:5001"):
        self.client = aiohttp.ClientSession()
        self.daemon_url = URL(daemon_url)

    # FIXME: MAKE ALL THIS ASYNC AAAAA
    async def put(self, data: bytes):
        add_url = self.daemon_url / "api/v0/add" % {"cid-version": 1, "pin": "true"}

        files = {"notebook.ipynb": data}

        resp = await self.client.post(add_url, data=files)
        cid = (await resp.json())["Hash"]

        return cid

    async def get(self, name: str):
        url = self.daemon_url / "api/v0/cat" % {"arg": name}

        resp = await self.client.post(url)
        if resp.status != 200:
            raise HTTPException(status_code=resp.status, detail=(await resp.text()))
        return await resp.read()
