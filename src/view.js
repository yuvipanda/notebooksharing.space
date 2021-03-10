import { setupUpload } from './upload';

import { iframeResize } from 'iframe-resizer';

import 'bootstrap/dist/css/bootstrap.min.css';
import './base.css';
import './view.css';

/*
 * We want only one per-document scrollbar, not a scrollbar inside the iframe.
 * We use https://github.com/davidjbradshaw/iframe-resizer to ensure that.
 */
document.addEventListener('DOMContentLoaded', function() {
    let iframes = document.getElementsByTagName('iframe');
    for (let iframe of iframes) {
        iframe.addEventListener('load', (ev) => iframeResize({log: true}, ev.target));
    }

    let uploadButton = document.getElementById('action-upload');
    setupUpload(uploadButton);
})
