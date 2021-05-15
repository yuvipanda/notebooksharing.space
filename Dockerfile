FROM python:3.9-buster AS builder

RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt install --yes nodejs > /dev/null

RUN mkdir -p /opt/nbss
WORKDIR  /opt/nbss

# Run npm install first - we only need to run it again if package.json changes
COPY package.json package.json
RUN npm i

# If any more files are needed to be built, they should be added here
COPY src src
COPY setup.py setup.py
COPY nbss nbss
COPY webpack.config.js webpack.config.js
COPY babel.config.json babel.config.json
COPY MANIFEST.in MANIFEST.in
COPY README.md README.md
COPY requirements.txt requirements.txt

RUN python3 setup.py bdist_wheel

FROM python:3.9-buster

RUN mkdir -p /tmp/nbss

COPY --from=builder /opt/nbss/dist/*.whl /tmp/nbss/
RUN pip install --no-cache /tmp/nbss/*.whl

USER nobody
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "nbss.app:app", "-b", "0.0.0.0:8000", "--access-logfile", "-"]