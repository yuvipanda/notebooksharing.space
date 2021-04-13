from nbconvert.exporters import HTMLExporter

from typing import Optional
import os
import nbformat
from jupytext import reads, writes

from fastapi import FastAPI, UploadFile, File, Request, Header, HTTPException, Path
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from storage import S3Backend

app = FastAPI(root_path="/")

BASE_PATH = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.environ.get("DATA_DIR", os.getcwd())
ID_VALIDATOR = Path(
    ...,
    min_length=64,
    max_length=64,
    regex=r"^[0-9a-f]{64,64}$",
)

templates = Jinja2Templates(directory=os.path.join(BASE_PATH, "templates"))
app.mount(
    "/static", StaticFiles(directory=os.path.join(BASE_PATH, "static")), name="static"
)

backend = S3Backend()


@app.post("/upload")
async def upload(
    notebook: UploadFile = File(...),
    host: Optional[str] = Header(None),
    x_forwarded_proto: str = Header("http"),
    accept: str = Header("text/plain"),
):
    data = await notebook.read()
    _, ext = os.path.splitext(notebook.filename)
    # Remove leading .
    # FIXME: Restrict what formats can be uploaded. Let's stick to notebook-like formats
    # https://github.com/mwouts/jupytext#which-text-format
    fmt = ext[1:]

    converted_data = nbformat.writes(reads(data.decode(), fmt=fmt)).encode()
    name = await backend.put(converted_data)

    # FIXME: is this really the best way?
    url = f"{x_forwarded_proto}://{host}{app.root_path}view/{name}"
    if accept == "application/json":
        return {"url": url}

    else:
        return Response(url + "\n")


@app.get("/view/{name}")
async def view(request: Request, name: str = ID_VALIDATOR, download: bool = False):
    if download:
        return Response(
            await backend.get(name),
            headers={
                "Content-Type": "application/json",
                "Content-Disposition": f"attachment; filename={name}.ipynb",
            },
        )
    return templates.TemplateResponse(
        "view.html.j2", {"name": name, "request": request}
    )


@app.get("/render/v1/{name}")
async def render(name: str = ID_VALIDATOR):
    exporter = HTMLExporter(
        # Input / output prompts are empty left gutter space
        # Let's remove them. If we want gutters, we can CSS them.
        exclude_input_prompt=True,
        exclude_output_prompt=True,
        extra_template_basedirs=[BASE_PATH],
        template_name="nbconvert-template",
    )
    data = await backend.get(name)
    if data is None:
        # No data found
        raise HTTPException(status_code=404)
    notebook = nbformat.reads(data, as_version=4)
    output, resources = exporter.from_notebook_node(notebook, {})
    return HTMLResponse(
        output,
        headers={
            # Disable embedding our rendered notebook in other websites
            # Don't want folks hotlinking our renders.
            "Content-Security-Policy": "frame-ancestors 'self';",
            "X-Frame-Options": "SAMEORIGIN",
            # Intensely cache everything here.
            # We can cache bust by purging everything with the cloudflare API,
            # or with query params. This is much simpler than caching on
            # the server side
            "Cache-Control": "public, max-age=604800, immutable",
        },
    )


@app.get("/")
async def render_front(request: Request):
    return templates.TemplateResponse("front.html.j2", {"request": request})
