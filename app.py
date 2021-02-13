from nbconvert.exporters import HTMLExporter
import shutil
import os
import hashlib
import tempfile

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import HTMLResponse, Response

app = FastAPI()

BASE_PATH = os.path.abspath(os.path.dirname(__file__))

@app.post("/upload")
async def upload(upload: UploadFile = File(...)):
    # I write to a temporary file, computing a sha256 as we go.
    # This lets me name the target file with the sha256
    sha256 = hashlib.sha256()
    _, temp_path= tempfile.mkstemp()

    try:
        with open(temp_path, mode='wb') as f:
            while True:
                data = await upload.read(4096)
                if len(data) == 0:
                    break
                sha256.update(data)
                f.write(data)

        hash = sha256.hexdigest()
        target_path = os.path.join(BASE_PATH, hash)
        shutil.move(temp_path, target_path)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    return Response(f'http://localhost:8000/view/{hash}\n', media_type='text/plain')

exporter = HTMLExporter(template_name="paste")

@app.get('/view/{name}')
async def render(name: str, download: bool = False):
    full_path = os.path.join(BASE_PATH, name)
    with open(full_path) as f:
        if download:
            return Response(f.read(), headers={
                "Content-Type": "application/json",
                "Content-Disposition": f'attachment; filename={name}.ipynb'
            })
        else:
            output, _ = exporter.from_file(f)
            return HTMLResponse(output)
