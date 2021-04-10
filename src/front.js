import { render } from "react-dom";
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './base.css';
import './front.css';

import { CreditFooter } from "./footer";
import { UploadForm, LicenseDeclaration } from './upload';

const Front = () => {
    return <>
        <div id="front">
            <h1> ipynb.pub </h1>
            <p>fastest way to publish your jupyter notebooks on the web</p>

            <div id="howto">
                <ol>
                    <li>
                        <UploadForm buttonClassName="big-button" buttonNormalLabel="Upload your notebook" />

                        <LicenseDeclaration />
                    </li>
                    <li> Get an immutable link to your notebook </li>
                    <li> Share the link with anyone you want! </li>
                </ol>

            </div>
        </div>
        <footer className="container sticky">
            <CreditFooter />
        </footer>
    </>;

}

document.addEventListener('DOMContentLoaded', function () {

    render(
        <Front />,
        document.getElementById("content")
    );
})
