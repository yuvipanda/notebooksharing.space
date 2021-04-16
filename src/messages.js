/**
 * This file is included in the notebook iframe too.
 * Any imports here will increase that bundle size. Think
 * twice before adding imports here
 */

const MESSAGE_TYPES = {
    SET_DISPLAY_OPTIONS: 1,
    FRAME_DOM_CONTENT_LOADED: 2,
    LOAD_HYPOTHESIS: 3
}

/**
 * Differentiate different message senders / receivers.
 * 
 * In particular, differentiate from the messages the iframeresizer sends.
 * 
 * https://github.com/davidjbradshaw/iframe-resizer/blob/a519ec84ad4efb8eaadf40fc072b5e523ffe45ac/js/iframeResizer.contentWindow.js#L1243
 */
const MESSAGE_ID = "[ipynb.space]";

const parseMessage = (message) => {
    if (String(event.data).substr(0, MESSAGE_ID.length) !== MESSAGE_ID) {
        return null;
    }
    return JSON.parse(event.data.substr(MESSAGE_ID.length));
}

/**
 * Setup inside notebook iframe to respond to messages
 */
const handleMessages = (event) => {
    const data = parseMessage(event.data);
    if (data === null) {
        return;
    }
    const body = document.getElementsByTagName('body')[0];
    switch (data.type) {
        case MESSAGE_TYPES.SET_DISPLAY_OPTIONS:
            const { availableDisplayOptions, selectedDisplayOptions } = data.payload;
            Object.keys(availableDisplayOptions).forEach(option => {
                if (selectedDisplayOptions.includes(option)) {
                    body.classList.add('option-' + option)
                } else {
                    body.classList.remove('option-' + option)
                }
            })
            break;
        case MESSAGE_TYPES.LOAD_HYPOTHESIS:
            const script = document.createElement('script')
            script.src = "https://hypothes.is/embed.js";
            script.async = true;
            document.head.appendChild(script);
            break
    }
}

const postMessage = (dest, type, payload) => {
    dest.postMessage(MESSAGE_ID + JSON.stringify({
        type: type,
        payload: payload
    }))
}

export { MESSAGE_TYPES, handleMessages, postMessage, parseMessage }