"""
Storage backends for ipynb.pub
"""
import shutil
import os
import gzip


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
