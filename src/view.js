import React, { useState } from "react";
import { render } from "react-dom";

import { UploadForm } from "./upload";

import { iframeResize } from 'iframe-resizer';

import 'bootstrap/dist/css/bootstrap.min.css';
import './base.css';
import './view.css';

/**
 * Returns notebook ID given a path
 * 
 * Path is expected to be of form /view/<id>
 */
const getNotebookID = (path) => {
    return path.split('/', 3)
}

const View = () => {
    // Expects path to be /view/<id>.
    // FIXME: This doesn't work with basepath
    const [hasLoaded, setHasLoaded] = useState(false);
    const notebookId = document.location.pathname.split('/')[2];
    console.log(notebookId)
    if (notebookId.match(/^[0-9a-f]{64,64}$/) === null) {
        console.log(notebookId + ' is not a valid id on ipynb.space')
        // TODO: Add a nice error page here
        return null;
    }
    return <>
        <header id="page-header">
            <h1> <a href="/">ipynb.pub</a> </h1>
            <p id="page-tagline">easy web publishing for your jupyter notebooks</p>
            <div className="page-actions">
                <UploadForm />
                <a href="?download=true" className="btn btn-light" tabIndex="0">Download this Notebook</a>
                <div>
                    <small className="license-declaration">Notebooks are licensed as <a href="https://creativecommons.org/share-your-work/public-domain/cc0/">CC0</a> to simplify sharing</small>
                </div>
            </div>
        </header>
        <div className={"d-flex justify-content-center " + (hasLoaded ? "hidden" : "")} >
            <div className="spinner-grow" id="frame-loading-spinner" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
        <iframe id="content-frame"
            className={hasLoaded ? "" : "hidden"}
            onLoad={(ev) => {
                iframeResize({}, ev.target);
                setHasLoaded(true);
            }}
            src={"/render/v1/" + notebookId}>
        </iframe>
    </>
};
/*
 * We want only one per-document scrollbar, not a scrollbar inside the iframe.
 * We use https://github.com/davidjbradshaw/iframe-resizer to ensure that.
 */
document.addEventListener('DOMContentLoaded', function () {
    render(
        <View />,
        document.getElementById('content')
    )
})
