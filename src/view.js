import React, { useState } from "react";
import { render } from "react-dom";

import { LicenseDeclaration, UploadForm } from "./upload";
import { CreditFooter, LicenseFooter } from "./footer";

import { iframeResize } from 'iframe-resizer';

import 'bootstrap/dist/css/bootstrap.min.css';
import './base.css';
import './view.css';

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
            <div className="brand">
                <h1> <a href="/">ipynb.pub</a> </h1>
                <span id="page-tagline">fastest way to publish your notebooks on the web</span>
            </div>
            <div className="page-actions">
                <UploadForm buttonNormalLabel="Upload new notebook" />
                <a href="?download=true" className="btn btn-light" tabIndex="0">Download this notebook</a>
                <div>
                    <LicenseDeclaration />
                </div>
            </div>
        </header>
        <div className={"d-flex justify-content-center " + (hasLoaded ? "hidden" : "")} >
            <div className="spinner-border" id="frame-loading-spinner" role="status">
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

        <footer className={"container " + (hasLoaded ? "" : "sticky")}>
            <LicenseFooter />
            <CreditFooter />
        </footer>
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
