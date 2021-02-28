from nbconvert.exporters import HTMLExporter
import shutil
import os
import gzip
import hashlib
import tempfile
import nbformat

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import HTMLResponse, Response, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from storage import FileBackend

app = FastAPI()

BASE_PATH = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.environ.get('DATA_DIR', os.getcwd())

templates = Jinja2Templates(directory=os.path.join(BASE_PATH, 'templates'))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_PATH, "static")), name="static")


backend = FileBackend()

@app.post("/upload")
async def upload(upload: UploadFile = File(...)):
    data = await upload.read()

    sha256 = hashlib.sha256()
    sha256.update(data)
    hash = sha256.hexdigest()

    backend.put(hash, data)

    return RedirectResponse(f'/view/{hash}', status_code=302)


@app.get('/view/{name}')
async def view(name: str, request: Request, download: bool = False):
    if download:
        return Response(backend.get(name), headers={
            "Content-Type": "application/json",
            "Content-Disposition": f'attachment; filename={name}.ipynb'
        })
    return templates.TemplateResponse(
        'view.html.j2', { 'name': name, 'request': request }
    )

@app.get('/render/v1/{name}')
async def render(name: str):
    exporter = HTMLExporter()
    notebook = nbformat.reads(backend.get(name), as_version=4)
    output, _ = exporter.from_notebook_node(notebook)
    return HTMLResponse(output)

@app.get('/')
async def render_front(request: Request):
    return templates.TemplateResponse('front.html.j2', {
        'request': request
    })
