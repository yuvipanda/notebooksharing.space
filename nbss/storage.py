"""
Storage backends
"""
import gzip
import hashlib
import json
import os
from typing import Tuple
from urllib.parse import quote, unquote

from aiobotocore.session import get_session


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

    async def get(self, name: str) -> Tuple[bytes, Metadata]:
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

    async def get(self, name: str) -> Tuple[bytes, Metadata]:
        with gzip.open(self.data_path_for_name(name)) as f:
            data = f.read()

        return (data, await self.get_metadata(name))


class S3Backend(StorageBackend):
    def __init__(self):
        self.endpoint_url = os.environ.get("AWS_S3_ENDPOINT_URL")
        self.bucket = os.environ["AWS_S3_BUCKET"]
        self.botocore_session = get_session()

    def path_for_name(self, name: str) -> str:
        return f"notebooks/{name}"

    async def put(self, data: bytes, metadata: Metadata) -> bytes:
        # s3 metadata values can only be ASCII (WTF?!), so we have to
        # percent encode all metadata values
        quoted_metadata = {k: quote(v) for k, v in metadata.to_dict().items()}
        name = sha256(data, quoted_metadata)

        async with self.botocore_session.create_client(
            "s3", endpoint_url=self.endpoint_url
        ) as s3:
            await s3.put_object(
                Key=self.path_for_name(name),
                Bucket=self.bucket,
                Body=gzip.compress(data),
                Metadata=quoted_metadata,
            )
        return name

    async def get_metadata(self, name: str) -> Metadata:
        async with self.botocore_session.create_client(
            "s3", endpoint_url=self.endpoint_url
        ) as s3:
            try:
                response = await s3.head_object(
                    Key=self.path_for_name(name), Bucket=self.bucket
                )
                # s3 metadata values can only be ASCII (WTF?!), so we store urlencoded
                # metadata. We decode it when we retrieve it.
                unquoted_metadata = {
                    k: unquote(v) for k, v in response["Metadata"].items()
                }
                metadata = Metadata.from_dict(unquoted_metadata)
            except s3.exceptions.NoSuchKey:
                return None
            return metadata

    async def get(self, name: str) -> Tuple[bytes, Metadata]:
        async with self.botocore_session.create_client(
            "s3", endpoint_url=self.endpoint_url
        ) as s3:
            try:
                response = await s3.get_object(
                    Key=self.path_for_name(name),
                    Bucket=self.bucket,
                )
                data = gzip.decompress(await response["Body"].read())

                # s3 metadata values can only be ASCII (WTF?!), so we store urlencoded
                # metadata. We decode it when we retrieve it.
                unquoted_metadata = {
                    k: unquote(v) for k, v in response["Metadata"].items()
                }
                metadata = Metadata.from_dict(unquoted_metadata)
            except s3.exceptions.NoSuchKey:
                return None
            return (data, metadata)
