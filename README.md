[![The NBSS logo](./src/logo.svg)](https://notebooksharing.space)

The fastest way to share your notebook with someone.

## Features

- Upload a notebook to get a link you can share with anyone.
- Supports uploading and rendering both Jupyter Notebook and
  RMarkdown files.
- Opt-in annotation support via [hypothes.is](https://hypothes.is/).
- Opt-in to allow discovery of your notebooks for search engines.


There are two ways to share your Notebooks

1. You can upload your notebook easily via the web interface at [notebooksharing.space](https://notebooksharing.space/) *(No Sign up required)*
2. `nbss-upload` Command-Line Tool


## CLI

`nbss-upload` is available on [PyPI](https://pypi.org/project/nbss-upload/), and can be installed with pip.

`pip install nbss-upload` 

**Usage**

Simply call it with the path to the notebook you want to upload.

```bash
$ nbss-upload test.ipynb
https://notebooksharing.space/view/04ab7ab45c2f08628eba9cb8fe5fb9a63f5961d5dfce622b9e26974ddc138916
```

This will upload the notebook and return the URL you can use to share it with others.

By default, only users who you share the URL with can access the notebook - it will not be visible to search engines. Annotations will also be turned off by default to help fight abuse.

You can enable annotations via hypothes.is by passing --enable-annotations or -a. The notebook can be made discoverable to search engines by passing --enable-discvery or -d.

All notebook formats supported by notebooksharing.space - .ipynb, .rmd, .html are supported.

