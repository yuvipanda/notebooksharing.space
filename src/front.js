import { render } from "react-dom";
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './base.css';
import './front.css';

import { UploadForm } from './upload';

const Front = () => {
    return <div id="front">
        <h1> ipynb.pub </h1>
        <p>easy web publishing for your jupyter notebooks</p>

        <div id="howto">
            <ol>
                <li>
                    <UploadForm buttonClassName="big-button" />
                    <small className="license-declaration">It will be licensed as <a href="https://creativecommons.org/share-your-work/public-domain/cc0/">CC0</a> to simplify sharing</small>
                </li>
                <li> Get an immutable link to your notebook </li>
                <li> Share the link with anyone you want! </li>
            </ol>

        </div>
    </div>

}

document.addEventListener('DOMContentLoaded', function () {

    render(
        <Front />,
        document.getElementById("content")
    );
})
