"""
Storage backends for ipynb.pub
"""
import asyncio
import aiohttp
import tempfile
import shutil
import os
import json
import gzip
import aioboto3
from yarl import URL
import hashlib


def sha256(data: bytes, raw_metadata: dict):
    digester = hashlib.sha256()
    digester.update(data)
    digester.update(json.dumps(raw_metadata, sort_keys=True).encode())
    return digester.hexdigest()


class Metadata:
    def __init__(self, name: str, raw_metadata: dict):
        self.filename = raw_metadata.get("filename", f"{name}.ipynb")

    def to_dict(self):
        return {"filename": self.filename}

    @property
    def format(self):
        return os.path.splitext(self.filename)[-1][1:]


class StorageBackend:
    async def put(self, data: bytes, raw_metadata: dict):
        pass

    async def get(self, name: str) -> (bytes, Metadata):
        pass


class FileBackend(StorageBackend):
    def __init__(self):
        self.data_path = os.environ.get("DATA_DIR", os.getcwd())

    def data_path_for_name(self, name: str) -> str:
        return os.path.join(self.data_path, name)

    def metadata_path_for_name(self, name: str) -> str:
        return os.path.join(self.data_path, name + ".metadata.json")

    async def put(self, data: bytes, raw_metadata: dict):
        name = sha256(data, raw_metadata)
        with gzip.open(self.data_path_for_name(name), "w") as f:
            f.write(data)
        with open(self.metadata_path_for_name(name), "w") as f:
            json.dump(raw_metadata, f)
        return name

    async def get(self, name: str) -> (bytes, Metadata):
        with gzip.open(self.data_path_for_name(name)) as f:
            data = f.read()

        # Metadata is optional
        try:
            with open(self.metadata_path_for_name(name)) as f:
                raw_metadata = json.load(f)
        except FileNotFoundError:
            raw_metadata = {}

        return (data, Metadata(name, raw_metadata))


class S3Backend(StorageBackend):
    def __init__(self):
        self.endpoint_url = os.environ.get("AWS_S3_ENDPOINT_URL")
        self.bucket = os.environ["AWS_S3_BUCKET"]

    def path_for_name(self, name: str) -> str:
        return f"notebooks/{name}"

    async def put(self, data: bytes, raw_metadata: dict) -> bytes:
        name = sha256(data, raw_metadata)
        async with aioboto3.client("s3", endpoint_url=self.endpoint_url) as s3:
            await s3.put_object(
                Key=self.path_for_name(name),
                Bucket=self.bucket,
                Body=gzip.compress(data),
                Metadata=raw_metadata,
            )
        return name

    async def get(self, name: str) -> (bytes, Metadata):
        async with aioboto3.client("s3", endpoint_url=self.endpoint_url) as s3:

            try:
                response = await s3.get_object(
                    Key=self.path_for_name(name),
                    Bucket=self.bucket,
                )
                data = gzip.decompress(await response["Body"].read())
                metadata = Metadata(name, response["Metadata"])
            except s3.exceptions.NoSuchKey:
                return None
            return (data, metadata)


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
