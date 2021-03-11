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
import naming
from fastapi import HTTPException
from yarl import URL


class StorageBackend:
    async def put(self, name: str, path: str):
        pass

    async def get(self, name: str) -> str:
        pass


class FileBackend(StorageBackend):
    def __init__(self, namer=naming.ipfs_cid):
        self.data_path = os.environ.get('DATA_DIR', os.getcwd())
        self.namer = namer

    def path_for_name(self, name: str) -> str:
        return os.path.join(self.data_path, name)

    async def put(self, data: bytes):
        name = await self.namer(data)
        with gzip.open(self.path_for_name(name), 'w') as f:
            f.write(data)
        return name

    async def get(self, name: str) -> bytes:
        with gzip.open(self.path_for_name(name)) as f:
            return f.read()


class S3Backend(StorageBackend):
    def __init__(self, namer=naming.ipfs_cid):
        self.endpoint_url = os.environ.get('AWS_S3_ENDPOINT_URL')
        self.bucket = os.environ['AWS_S3_BUCKET']
        self.namer = namer

    def path_for_name(self, name: str) -> str:
        return f'notebooks/{name}'

    async def put(self, data: bytes):
        name = await self.namer(data)
        async with aioboto3.client('s3', endpoint_url=self.endpoint_url) as s3:
            await s3.put_object(
                Key=self.path_for_name(name),
                Bucket=self.bucket,
                Body=gzip.compress(data)
            )
        return name


    async def get(self, name: str):
        async with aioboto3.client('s3', endpoint_url=self.endpoint_url) as s3:
            gzip_response = await (await s3.get_object(
                Key=self.path_for_name(name),
                Bucket=self.bucket,
            ))['Body'].read()
            return gzip.decompress(gzip_response)


class IPFSBackend(StorageBackend):
    def __init__(self, namer=None, daemon_url='http://localhost:5001'):
        self.namer = namer
        self.client = aiohttp.ClientSession()
        self.daemon_url = URL(daemon_url)

    # FIXME: MAKE ALL THIS ASYNC AAAAA
    async def put(self, data: bytes):
        add_url = self.daemon_url / 'api/v0/add' % {'cid-version': 1}

        files = {
            'notebook.ipynb': data
        }

        resp = await self.client.post(add_url, data=files)
        cid = (await resp.json())['Hash']

        # Calling `ipfs add` pins the object as well, but
        # talking directly to the API does not. Since we want to
        # preserve all our notebooks, we shall pin it explicitly
        pin_url = self.daemon_url / 'api/v0/pin/add' % {'arg': cid}

        await self.client.post(pin_url)

        return cid




    async def get(self, name: str):
        url = self.daemon_url / 'api/v0/cat' % {'arg': name}

        resp = await self.client.post(url)
        if resp.status != 200:
            raise HTTPException(
                status_code=resp.status,
                detail=(await resp.text())
            )
        return await resp.read()
