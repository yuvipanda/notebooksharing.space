import { iframeResizerContentWindow } from 'iframe-resizer';

import { handleMessages } from './messages';

import "./notebook.css";

window.addEventListener('message', handleMessages);
