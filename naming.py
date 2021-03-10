import asyncio
import tempfile
import hashlib

async def sha256(data: bytes):
    digester = hashlib.sha256()
    digester.update(data)
    return digester.hexdigest()

async def get_ipfs_cid(filename: str):
    """
    Use IPFS CID as key for all uploads.

    Makes life easier when we *do* move to using IPFS
    """
    cmd = [
        'ipfs', 'add', '--cid-version', '1', '-n', filename
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE)

    stdout, _ = await proc.communicate()
    return stdout.decode().split('\n')[0].split(' ')[1]

async def ipfs_cid(data: bytes):
    with tempfile.NamedTemporaryFile() as f:
        f.write(data)
        f.flush()

        return await get_ipfs_cid(f.name)
