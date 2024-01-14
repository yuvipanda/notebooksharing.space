import sys
from pathlib import Path
from subprocess import check_call
from tempfile import TemporaryDirectory

from setuptools import find_packages, setup

HERE = Path(__file__).parent

# With apologies to the folks who have spent a lot of time on pyproject.toml
check_call(["npm", "run", "prod"], cwd=HERE)


def build_jupyterlite():
    """
    Build JupyterLite contents in a separate venv
    """
    with TemporaryDirectory() as d:
        check_call([sys.executable, "-m", "venv", d])
        check_call(
            [
                f"{d}/bin/pip",
                "install",
                "-r",
                str(HERE / "jupyterlite-config/requirements.txt"),
            ],
            cwd=d,
        )
        check_call(
            [
                f"{d}/bin/jupyter-lite",
                "build",
                "--lite-dir",
                str(HERE / "jupyterlite-config"),
                "--output-dir",
                str(HERE / "nbss/static/jupyterlite"),
            ],
            cwd=d,
        )


build_jupyterlite()

setup(
    name="nbss",
    version="0.1",
    url="https://github.com/notebook-sharing-space/nbss",
    license="3-clause BSD",
    author="Yuvi Panda",
    author_email="yuvipanda@gmail.com",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    packages=find_packages(),
    include_package_data=True,
)
