import React, { useEffect, useState, useRef } from "react";
import { ChakraProvider, MenuButton } from "@chakra-ui/react"
import { render } from "react-dom";
import querystring from "querystring";
import { LicenseDeclaration, UploadForm } from "./upload";
import { CreditFooter, LicenseFooter } from "./footer";
import { postMessage, MESSAGE_TYPES } from './messages';
import { Button, ButtonGroup, Menu, MenuItem, MenuList, MenuOptionGroup, MenuItemOption, CircularProgress } from '@chakra-ui/react';
import { ChevronDownIcon, DownloadIcon, } from '@chakra-ui/icons'
import { Container, Center, Link } from "@chakra-ui/react"

import { iframeResize } from 'iframe-resizer';

import './base.css';
import './view.css';

const makeDownloadLink = (notebookId) => {
    return "/view/" + notebookId + "?download=true"
}

const makeIFrameLink = (notebookId) => {
    // FIXME This is not safe
    // Incrememnt cache version here whenever we make a change in HTML
    // structure of the rendered notebook.
    return "/render/v1/" + notebookId + "?cacheVersion=1";

}

const updateFragmentOptions = (options) => {
    let loc = new URL(window.location);
    const fragmentParams = querystring.parse(window.location.hash.replace(/^#/, ''))
    fragmentParams.displayOptions = options.join('|');
    loc.hash = querystring.stringify(fragmentParams);
    history.pushState({}, '', loc)
}

const getDisplayOptions = () => {
    const fragmentOptions = querystring.parse(window.location.hash.replace(/^#/, ''));
    if (fragmentOptions.displayOptions) {
        return fragmentOptions.displayOptions.split('|')
    }
    return []

}
const ViewOptions = ({ iframeRef, notebookId, hasFrameLoaded }) => {
    const availableDisplayOptions = {
        'hide-inputs': 'Hide code cells'
    }
    const [displayOptions, setDisplayOptions] = useState(getDisplayOptions())

    useEffect(() => {
        postMessage(iframeRef.current.contentWindow, MESSAGE_TYPES.SET_DISPLAY_OPTIONS, {
            availableDisplayOptions: availableDisplayOptions,
            selectedDisplayOptions: displayOptions
        });
        updateFragmentOptions(displayOptions)
    }, [displayOptions])

    useEffect(() => {
        // FIXME: Fix this duplication
        postMessage(iframeRef.current.contentWindow, MESSAGE_TYPES.SET_DISPLAY_OPTIONS, {
            availableDisplayOptions: availableDisplayOptions,
            selectedDisplayOptions: displayOptions
        });
    }, [hasFrameLoaded])

    return <Menu>
        <MenuButton as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
            More actions
            </MenuButton>

        <MenuList >
            {/* Explicitly set hover style here, we don't want the underline to show up*/}
            <MenuItem icon={<DownloadIcon />} as={Link} href={makeDownloadLink(notebookId)} _hover={{ textDecoration: 'none' }}>
                Download this notebook
            </MenuItem>

            <MenuOptionGroup title="Display options" type="checkbox" onChange={setDisplayOptions} value={displayOptions}>
                {Object.keys(availableDisplayOptions).map((option) => {
                    return <MenuItemOption value={option} key={option}>
                        {availableDisplayOptions[option]}
                    </MenuItemOption>
                })}
            </MenuOptionGroup>
        </MenuList>
    </Menu >;
}

const View = () => {
    const [hasLoaded, setHasLoaded] = useState(false);
    const iframeRef = useRef(null);
    // Expects path to be /view/<id>.
    // FIXME: This doesn't work with basepath
    const notebookId = document.location.pathname.split('/')[2];
    console.log(notebookId)
    if (notebookId.match(/^[0-9a-f]{64,64}$/) === null) {
        console.log(notebookId + ' is not a valid id on ipynb.space')
        // TODO: Add a nice error page here
        return null;
    }
    return <>
        <Container maxW='container.lg'>
            <header id="page-header">
                <div className="brand">
                    <h1> <a href="/">ipynb.pub</a> </h1>
                    <span id="page-tagline">fastest way to publish your notebooks on the web</span>
                </div>
                <div className="page-actions">

                    <ButtonGroup isAttached>
                        <UploadForm buttonNormalLabel="Upload new notebook" />
                        <ViewOptions notebookId={notebookId} iframeRef={iframeRef} hasFrameLoaded={hasLoaded} />
                    </ButtonGroup>
                    <div className="text-right">
                        <LicenseDeclaration />
                    </div>
                </div>
            </header>
            {hasLoaded ||
                <Center>
                    <CircularProgress isIndeterminate color="orange" />
                </Center>
            }
            <div id="content-frame-container"
                className={hasLoaded ? "" : "hidden"}>
                <iframe id="content-frame"
                    ref={iframeRef}
                    onLoad={(ev) => {
                        iframeResize({}, ev.target);
                        setHasLoaded(true);
                    }}
                    src={makeIFrameLink(notebookId)}>
                </iframe>
            </div>
            <Center>
                <footer className={hasLoaded ? "" : "sticky"}>
                    <LicenseFooter />
                    <CreditFooter />
                </footer>
            </Center>
        </Container>

    </>
};

document.addEventListener('DOMContentLoaded', function () {
    render(
        <ChakraProvider>
            <View />
        </ChakraProvider>,
        document.getElementById('content')
    )
})
