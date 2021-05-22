import { iframeResizerContentWindow } from 'iframe-resizer';

import { handleMessages, postMessage, MESSAGE_TYPES } from './messages';

import "@fontsource/ibm-plex-serif";
import "@fontsource/ibm-plex-sans";
import "@fontsource/ibm-plex-mono";

import "./notebook.css";

window.addEventListener('message', handleMessages);

window.addEventListener('DOMContentLoaded', () => {
    // Can't access DOMContentLoaded of frame from parent, so we explicitly post
    // a message up to top window
    postMessage(window.top, MESSAGE_TYPES.FRAME_DOM_CONTENT_LOADED, {});
})