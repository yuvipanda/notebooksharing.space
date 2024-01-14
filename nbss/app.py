import os
from typing import Optional, Union
from urllib.parse import quote

import jupytext
import nbformat
from content_size_limit_asgi import ContentSizeLimitMiddleware
from fastapi import (
    FastAPI,
    File,
    Form,
    Header,
    HTTPException,
    Path,
    Request,
    UploadFile,
)
from fastapi.responses import HTMLResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from jupytext.config import JupytextConfiguration
from lxml.html.clean import clean_html
from nbconvert.exporters import HTMLExporter
from nbconvert.exporters.templateexporter import default_filters
from pydantic import BaseModel

from .storage import Metadata, S3Backend

BASE_PATH = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.environ.get("DATA_DIR", os.getcwd())
ID_VALIDATOR = Path(
    ...,
    min_length=64,
    max_length=64,
    regex=r"^[0-9a-f]{64,64}$",
    description="Notebook ID",
)

# Use lxml's clean_html instead of bleach's, so we can still use tables for
# line numbers, as that is what is supported by pygments. This is from
# https://github.com/jupyter/nbconvert/issues/1892#issuecomment-1294475221/
# This can be removed once https://github.com/jupyter/nbconvert/pull/2083 lands
# and is released.
default_filters["clean_html"] = clean_html

templates = Jinja2Templates(directory=os.path.join(BASE_PATH, "templates"))

app = FastAPI(
    title="nbss",
    description="fastest way to publish your notebooks on the web",
    openapi_tags=[
        {"name": "api", "description": "REST API, for machines"},
        {"name": "website", "description": "Website, for humans"},
    ],
)
app.mount(
    "/static", StaticFiles(directory=os.path.join(BASE_PATH, "static")), name="static"
)

# Mount a copy of our jupyterlite, in a way that renders index.html correctly
app.mount(
    "/jupyterlite",
    StaticFiles(directory=os.path.join(BASE_PATH, "static/jupyterlite"), html=True),
    name="jupyterlite",
)
# No files larger than 10MB
app.add_middleware(ContentSizeLimitMiddleware, max_content_size=10 * 1024 * 1024)

backend = S3Backend()


class NotebookUploadResponse(BaseModel):
    url: str
    notebookId: str


@app.post(
    "/api/v1/notebook",
    summary="Upload a notebook",
    tags=["api"],
    response_model=Union[NotebookUploadResponse, str],
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": {
                        "url": "https://notebooksharing.space/view/b7d0bf3209dd925ca41ce068660860624ba229127ed27855fbf4c7a22044b79f",
                        "notebookId": "b7d0bf3209dd925ca41ce068660860624ba229127ed27855fbf4c7a22044b79f",
                    }
                },
                "text/plain": {
                    "example": "https://notebooksharing.space/view/b7d0bf3209dd925ca41ce068660860624ba229127ed27855fbf4c7a22044b79f"
                },
            }
        }
    },
)
async def upload(
    response: Response,
    enable_discovery: bool = Form(
        ...,
        alias="enable-discovery",
        description="Allow search engines to index this notebook",
    ),
    enable_annotations: bool = Form(
        ...,
        alias="enable-annotations",
        description="Enable hypothes.is based annotations UI when this notebook is rendered",
    ),
    notebook: UploadFile = File(
        ...,
        description="Notebook data, in any format supported by Jupytext (.ipynb, .md, .Rmd, .py, etc)",
    ),
    host: Optional[str] = Header(None),
    x_forwarded_proto: str = Header("http"),
    accept: str = Header("text/plain"),
):
    """
    Upload a new notebook
    """

    data = await notebook.read()

    metadata = Metadata(
        filename=notebook.filename,
        enable_discovery=enable_discovery,
        enable_annotations=enable_annotations,
    )
    notebook_id = await backend.put(data, metadata)

    # Allow any origin to upload notebooks here
    response.headers["Access-Control-Allow-Origin"] = "*"
    # FIXME: is this really the best way?
    url = f"{x_forwarded_proto}://{host}/view/{notebook_id}"
    if accept == "application/json":
        return {"url": url, "notebookId": notebook_id}
    else:
        return Response(url + "\n", media_type="text/plain")


@app.get(
    "/api/v1/notebook/{notebook_id}",
    summary="Download a notebook",
    tags=["api"],
    response_class=PlainTextResponse,
)
@app.get(
    # JupyterLab doesn't respect the filename from Content-Disposition, and we want to support loading from
    # the URL. Until https://github.com/jupyterlab/jupyterlab/issues/11531 is fixed, we need to
    # provide the name of the notebook itself in the URL.
    "/api/v1/notebook/{notebook_id}/{filename}",
    summary="Download a notebook",
    tags=["api"],
    response_class=PlainTextResponse,
)
async def download(
    request: Request, notebook_id: str = ID_VALIDATOR, filename: str = None
):
    """
    Download a notebook.

    Notebook will be in the same format it was uploaded in.
    """
    data, metadata = await backend.get(notebook_id)
    encoded_filename = quote(metadata.filename)
    if filename is not None:
        if filename != metadata.filename:
            raise HTTPException(
                status_code=403,
                detail="If filename is passed in, it must match the name of the uploaded file",
            )
    return PlainTextResponse(
        data,
        headers={
            # Quote file name and mark it explicitly as utf-8
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
            # Allow JupyterLab to fetch this URL from anywhere with just JS
            # Supports https://github.com/jupyterlab/jupyterlab/pull/11387
            "Access-Control-Allow-Origin": "*",
            # Allow access to extra headers such as Content-Disposition
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@app.get("/view/{notebook_id}", tags=["website"])
async def view(request: Request, notebook_id: str = ID_VALIDATOR):
    # FIXME: Cache this somewhere
    metadata = await backend.get_metadata(notebook_id)
    # Metadata that affects display of page only
    # Let's not change HTML unless we have to - better cache hit ratio this way
    page_properties = {
        "id": notebook_id,
        "filename": metadata.filename,
        "format": metadata.format,
    }
    return templates.TemplateResponse(
        "view.html.j2",
        {
            "notebook_id": notebook_id,
            "request": request,
            "object_metadata": metadata,
            "enable_annotations": metadata.enable_annotations,
            "page_properties": page_properties,
        },
    )


@app.get("/render/v1/{notebook_id}", tags=["website"])
async def render(notebook_id: str = ID_VALIDATOR):
    traitlets_config = {
        "Highlight2HTML": {"extra_formatter_options": {"linenos": "table"}}
    }
    exporter = HTMLExporter(
        # Input / output prompts are empty left gutter space
        # Let's remove them. If we want gutters, we can CSS them.
        exclude_input_prompt=True,
        exclude_output_prompt=True,
        extra_template_basedirs=[BASE_PATH],
        template_name="nbconvert-template",
        config=traitlets_config,
    )
    data, metadata = await backend.get(notebook_id)
    if data is None:
        # No data found
        raise HTTPException(status_code=404)

    if metadata.format == "html":
        # R notebooks
        # I HATE THIS BUT WHAT TO DO?
        # We need notebook.js inside the iframe to respond to messages,
        # and resize iframe appropriately. We don't have control over the HTML
        # and I don't want to parse it. Instead, we just shove this in there.
        # VALID HTML!? WHO KNOWS?!
        output = "<script src='/static/notebook.js'></script>\n" + data.decode()
    else:
        if metadata.format == "ipynb":
            notebook = nbformat.reads(data.decode(), as_version=4)
        else:
            config = JupytextConfiguration()
            # Don't put Rmd and other 'front matter' as a raw cell in the notebook output
            # Ideally we'd be able to parse this and display it nicely, but lacking that
            # let's not output some raw YAML in the display.
            config.root_level_metadata_as_raw_cell = False
            notebook = jupytext.reads(data.decode(), metadata.format, config=config)
        output, resources = exporter.from_notebook_node(
            notebook, {"object_metadata": metadata}
        )
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


@app.get("/", tags=["website"])
async def render_front(request: Request):
    return templates.TemplateResponse("front.html.j2", {"request": request})
