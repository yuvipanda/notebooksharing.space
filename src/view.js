import React, { useEffect, useState, useRef } from "react";
import { render } from "react-dom";
import querystring from "querystring";

import { LicenseDeclaration, UploadForm } from "./upload";
import { CreditFooter, LicenseFooter } from "./footer";
import { postMessage, MESSAGE_TYPES } from './messages';

import { iframeResize } from 'iframe-resizer';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './base.css';
import './view.css';

const ViewOption = ({ name, label, checked, setChecked }) => {
    return <div className="custom-control custom-checkbox">
        <input type="checkbox" className="custom-control-input" id={name}
            checked={checked} onChange={(ev) => setChecked(ev.target.checked)}>
        </input>
        <label className="custom-control-label" htmlFor={name}>
            {label}
        </label>
    </div>
}

const setFragmentOptions = (options) => {
    let loc = new URL(window.location);
    let filteredOptions = {};
    Object.entries(options).forEach(([k, v]) => {
        console.log(k, v)
        if (v) {
            filteredOptions[k] = v;
        }
    })
    loc.hash = querystring.stringify(filteredOptions);
    history.pushState({}, '', loc)
}

const getFragmentOptions = () => {
    const fragmentOptions = querystring.parse(window.location.hash.replace(/^#/, ''));
    let filteredOptions = {};
    Object.entries(fragmentOptions).forEach(([k, v]) => {
        if (v === 'true') {
            filteredOptions[k] = true
        } else if (v === 'false') {
            filteredOptions[k] = false;
        } else {
            filteredOptions[k] = v
        }
    })
    return filteredOptions;
}

const ViewOptions = ({ iframeRef }) => {
    const [options, setOptions] = useState({
        "hide-inputs": false
    });

    useEffect(() => {
        const fragmentOptions = getFragmentOptions();
        Object.entries(fragmentOptions).forEach(([k, v]) => {
            console.log(k, v)
            setOption(k, v)
        })
    }, []);
    const setOption = (optionName, selected) => {
        postMessage(iframeRef.current.contentWindow, MESSAGE_TYPES.SET_VIEW_OPTION, {
            option: optionName,
            selected: selected
        });
        const newOptions = { ...options };
        newOptions[optionName] = selected;
        setOptions(newOptions)
        setFragmentOptions(newOptions)
    }

    return <div className="dropdown float-right">
        <button className="btn btn-light btn-sm dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Display options
        </button>
        <div className="dropdown-menu dropdown-menu-right">
            <form className="px-2 py-2">
                {Object.keys(options).map(optionName => {
                    return <ViewOption name={optionName} key={optionName} label="Hide Code Cells"
                        checked={options[optionName]}
                        setChecked={checked => setOption(optionName, checked)} />
                })}
            </form>
        </div>
    </div>
}

const View = () => {
    const [hasLoaded, setHasLoaded] = useState(false);
    const iframeRef = useRef(null);
    // Expects path to be /view/<id>.
    // FIXME: This doesn't work with basepath
    const notebookId = document.location.pathname.split('/')[2];
    console.log(notebookId)
    if (notebookId.match(/^[0-9a-f]{64, 64}$/) === null) {
        console.log(notebookId + ' is not a valid id on ipynb.space')
        // TODO: Add a nice error page here
        // return null;
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
        <div id="content-frame-container"
            className={hasLoaded ? "" : "hidden"}>
            {hasLoaded &&
                <ViewOptions iframeRef={iframeRef} />
                // Load ViewOptions after the content has loaded
                // ViewOptions posts messages to the iframe, won't work if iframe isn't
                // loaded!
            }
            <iframe id="content-frame"
                ref={iframeRef}
                onLoad={(ev) => {
                    iframeResize({}, ev.target);
                    setHasLoaded(true);
                }}
                src={"/render/v1/" + notebookId}>
            </iframe>
        </div>

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
