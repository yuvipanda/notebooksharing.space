import { setupUpload } from './upload';

import iframeResize from 'iframe-resizer';

import 'bootstrap/dist/css/bootstrap.min.css';
import './base.css';
import './view.css';
/*
 * We want only one per-document scrollbar, not a scrollbar inside the iframe.
 * We use https://github.com/davidjbradshaw/iframe-resizer to ensure that.
 */

/**
 * Called when an iframe is fully loaded.
 *
 * Injects appropriate iframe-resizer script into loaded iframe
 * Calls external iFrameResize function once that script is loaded
 */
function onIFrameLoad(iframe) {
    const iframeContentScript = "https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.1/js/iframeResizer.contentWindow.min.js";

    const doc = iframe.contentWindow.document;
    let script = doc.createElement('script');
    script.src = iframeContentScript;
    script.addEventListener('load', () => {
        iFrameResize({log: true}, iframe)
    });

    doc.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function() {
    let iframes = document.getElementsByTagName('iframe');
    for (let iframe of iframes) {
        iframe.addEventListener('load', (ev) => onIFrameLoad(ev.target));
    }

    let uploadButton = document.getElementById('action-upload');
    setupUpload(uploadButton);
})
