"""
Storage backends for ipynb.pub
"""
import os
import json
import gzip
import aioboto3
import hashlib
from typing import Tuple


def sha256(data: bytes, raw_metadata: dict):
    digester = hashlib.sha256()
    digester.update(data)
    digester.update(json.dumps(raw_metadata, sort_keys=True).encode())
    return digester.hexdigest()


class Metadata:
    @classmethod
    def from_dict(cls, raw_metadata):
        """
        Create metadata object from raw dictionary.

        - Keys and values can be only strings - that is what S3 metadata accepts
        - "true" and "false" used for bools. BREAKS MY HEART
        - Defaults for unset metadata is specified here
        """
        return cls(
            filename=raw_metadata["filename"],
            enable_discovery=raw_metadata.get("enable-discovery") == "true",
            enable_annotations=raw_metadata.get("enable-annotations") == "true",
        )

    def __init__(self, filename: str, enable_discovery: bool, enable_annotations: bool):
        self.filename = filename
        self.enable_discovery = enable_discovery
        self.enable_annotations = enable_annotations

    def to_dict(self):
        return {
            "filename": self.filename,
            "enable-discovery": "true" if self.enable_discovery else "false",
            "enable-annotations": "true" if self.enable_annotations else "false",
        }

    @property
    def format(self):
        return os.path.splitext(self.filename)[-1][1:]


class StorageBackend:
    async def put(self, data: bytes, raw_metadata: dict):
        pass

    async def get(self, name: str) -> Tuple(bytes, Metadata):
        pass


class FileBackend(StorageBackend):
    def __init__(self):
        self.data_path = os.environ.get("DATA_DIR", os.getcwd())

    def data_path_for_name(self, name: str) -> str:
        return os.path.join(self.data_path, name)

    def metadata_path_for_name(self, name: str) -> str:
        return os.path.join(self.data_path, name + ".metadata.json")

    async def put(self, data: bytes, metadata: Metadata):
        name = sha256(data, metadata.to_dict())
        with gzip.open(self.data_path_for_name(name), "w") as f:
            f.write(data)
        with open(self.metadata_path_for_name(name), "w") as f:
            json.dump(metadata.to_dict(), f)
        return name

    async def get_metadata(self, name: str) -> Metadata:
        try:
            with open(self.metadata_path_for_name(name)) as f:
                raw_metadata = json.load(f)
        except FileNotFoundError:
            raw_metadata = {}

        return Metadata.from_dict(raw_metadata)

    async def get(self, name: str) -> Tuple(bytes, Metadata):
        with gzip.open(self.data_path_for_name(name)) as f:
            data = f.read()

        return (data, await self.get_metadata(name))


class S3Backend(StorageBackend):
    def __init__(self):
        self.endpoint_url = os.environ.get("AWS_S3_ENDPOINT_URL")
        self.bucket = os.environ["AWS_S3_BUCKET"]

    def path_for_name(self, name: str) -> str:
        return f"notebooks/{name}"

    async def put(self, data: bytes, metadata: Metadata) -> bytes:
        name = sha256(data, metadata.to_dict())
        async with aioboto3.client("s3", endpoint_url=self.endpoint_url) as s3:
            await s3.put_object(
                Key=self.path_for_name(name),
                Bucket=self.bucket,
                Body=gzip.compress(data),
                Metadata=metadata.to_dict(),
            )
        return name

    async def get_metadata(self, name: str) -> Metadata:
        async with aioboto3.client("s3", endpoint_url=self.endpoint_url) as s3:
            try:
                response = await s3.head_object(
                    Key=self.path_for_name(name), Bucket=self.bucket
                )
                metadata = Metadata.from_dict(response["Metadata"])
            except s3.exceptions.NoSuchKey:
                return None
            return metadata

    async def get(self, name: str) -> Tuple(bytes, Metadata):
        async with aioboto3.client("s3", endpoint_url=self.endpoint_url) as s3:

            try:
                response = await s3.get_object(
                    Key=self.path_for_name(name),
                    Bucket=self.bucket,
                )
                data = gzip.decompress(await response["Body"].read())
                metadata = Metadata.from_dict(response["Metadata"])
            except s3.exceptions.NoSuchKey:
                return None
            return (data, metadata)