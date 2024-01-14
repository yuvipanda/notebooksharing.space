FROM python:3.11-bookworm AS builder

RUN apt update >/dev/null && apt install --yes nodejs npm >/dev/null

RUN mkdir -p /opt/nbss
WORKDIR /opt/nbss

# Run npm install first - we only need to run it again if package.json changes
COPY package.json package.json
RUN npm i --legacy-peer-deps

# If any more files are needed to be built, they should be added here
COPY src src
COPY setup.py setup.py
COPY nbss nbss
COPY webpack.config.js webpack.config.js
COPY babel.config.json babel.config.json
COPY MANIFEST.in MANIFEST.in
COPY README.md README.md
COPY requirements.txt requirements.txt
COPY jupyterlite-config jupyterlite-config

RUN python3 -m pip install -r requirements.txt
RUN python3 setup.py bdist_wheel
RUN python3 -m pip wheel -r requirements.txt --wheel-dir /tmp/nbss/dist/

FROM python:3.11-slim-bookworm

RUN mkdir -p /tmp/nbss

COPY --from=builder /opt/nbss/dist/*.whl /tmp/nbss/
RUN pip install --no-cache /tmp/nbss/*.whl

USER nobody
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "nbss.app:app", "-b", "0.0.0.0:8000", "--access-logfile", "-"]
