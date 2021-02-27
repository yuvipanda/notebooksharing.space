from nbconvert.exporters import HTMLExporter
import shutil
import os
import hashlib
import tempfile

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import HTMLResponse, Response, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory='templates')
app.mount("/static", StaticFiles(directory="static"), name="static")

BASE_PATH = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.getcwd()

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
        target_path = os.path.join(DATA_DIR, hash)
        shutil.move(temp_path, target_path)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

    return RedirectResponse(f'/view/{hash}', status_code=302)


@app.get('/view/{name}')
async def view(name: str, request: Request, download: bool = False):
    if download:
        full_path = os.path.join(DATA_DIR, name)
        with open(full_path) as f:
            return Response(f.read(), headers={
                "Content-Type": "application/json",
                "Content-Disposition": f'attachment; filename={name}.ipynb'
            })
    return templates.TemplateResponse(
        'view.html.j2', { 'name': name, 'request': request }
    )

@app.get('/render/v1/{name}')
async def render(name: str):
    exporter = HTMLExporter()
    print('name is ', name)
    # exporter = HTMLExporter(template_name="paste", extra_template_basedirs=[BASE_PATH])
    full_path = os.path.join(DATA_DIR, name)
    with open(full_path) as f:
        output, _ = exporter.from_file(f)
        return HTMLResponse(output)

@app.get('/')
async def render_front(request: Request):
    return templates.TemplateResponse('front.html.j2', {
        'request': request
    })
