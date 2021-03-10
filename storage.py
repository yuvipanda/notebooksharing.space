"""
Storage backends for ipynb.pub
"""
import asyncio
import tempfile
import shutil
import os
import gzip
import aioboto3
import naming


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
    def __init__(self, namer=None):
        self.namer = namer

    # FIXME: MAKE ALL THIS ASYNC AAAAA
    async def put(self, data: bytes):
        with tempfile.NamedTemporaryFile() as f:
            f.write(data)
            f.flush()

            cmd = [
                'ipfs', 'add', '--cid-version', '1', f.name
            ]
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE)

            stdout, _ = await proc.communicate()
            return stdout.decode().split('\n')[0].split(' ')[1]

    async def get(self, name: str):
        cmd = [
            'ipfs', 'cat', name
        ]
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE)

        stdout, _ = await proc.communicate()
        return stdout
