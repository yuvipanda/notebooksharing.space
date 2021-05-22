import { DownloadIcon } from '@chakra-ui/icons';
import { Box, Center, Heading, ChakraProvider, Container, Flex, IconButton, Image, Link, Menu, MenuButton, MenuItem, MenuItemOption, MenuList, MenuOptionGroup, Spacer, Spinner, Text } from "@chakra-ui/react";
import { iframeResize } from 'iframe-resizer';
import querystring from "querystring";
import React, { useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import { FaChevronDown } from "react-icons/fa";
import { Footer } from "./footer";
import logo from "./logo.svg";
import { MESSAGE_TYPES, parseMessage, postMessage } from './messages';
import { UploadForm } from "./upload";

import theme from "./theme";

const makeDownloadLink = (notebookId) => {
    return "/api/notebook/" + notebookId;
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


const NotebookOptions = ({ iframeRef, notebookId, hasFrameLoaded, ...props }) => {
    const availableDisplayOptions = {
        'hide-inputs': 'Hide code cells',
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

    return <Menu {...props}>
        <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FaChevronDown />}
            variant="ghost"
            size="xs"
        />

        <MenuList >
            {/* Explicitly set hover style here, we don't want the underline to show up*/}
            <MenuItem icon={<DownloadIcon />} as={Link} href={makeDownloadLink(notebookId)} _hover={{ textDecoration: 'none' }}>
                Download notebook
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

const ContentHeader = ({ filename, notebookId, iframeRef, hasFrameLoaded, ...props }) => {
    return <Flex alignItems="baseline" {...props}>
        <Text fontSize="xl" fontWeight={300}>{filename}</Text>
        <NotebookOptions iframeRef={iframeRef} notebookId={notebookId} hasFrameLoaded={hasFrameLoaded} color="black" />
    </Flex>
}

const View = ({ pageProperties }) => {
    const notebookId = pageProperties.id;
    const [hasLoaded, setHasLoaded] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        // Can't connect to DOMContentLoaded of iframe from parent, so
        // we explicitly listen for a message from child instead.
        window.addEventListener('message', (event) => {
            const data = parseMessage(event);
            if (data && data.type == MESSAGE_TYPES.FRAME_DOM_CONTENT_LOADED) {
                setHasLoaded(true)
                iframeResize({ checkOrigin: false }, iframeRef.current);
                postMessage(iframeRef.current.contentWindow, MESSAGE_TYPES.LOAD_HYPOTHESIS, {});
                // FIXME: Remove this event listener
            }
        })
    }, [])

    return <>
        <Box>
            <Container maxW="container.lg">
                <Flex alignItems="top" paddingBottom={4} paddingTop={4}>
                    <Flex direction="column" alignItems="baseline">
                        <Link _hover={{ textDecoration: "none" }} href="/" marginTop={1}><Image src={logo} height={8} /></Link>
                        <Text fontSize="md" marginTop={1}>the fastest way to share your notebooks</Text>
                    </Flex>
                    <Spacer />
                    <UploadForm size="lg" />
                </Flex>

            </Container>
        </Box>

        <Container maxW="container.lg" boxShadow="0px 0px 12px -4px #939393" marginTop={6} marginBottom={8}>
            <ContentHeader
                filename={pageProperties.filename} notebookId={notebookId}
                iframeRef={iframeRef} hasFrameLoaded={hasLoaded}
                paddingLeft={8}
                paddingRight={8}
                paddingTop={4}
                paddingBottom={4}
                borderBottom="1px dotted"
                borderBottomColor="gray.400"
            />
            <Box padding={2} paddingLeft={6} minHeight={128}>
                {hasLoaded ||
                    <Center>
                        <Spinner color="orange" size="xl" />
                    </Center>}
                <iframe width="100%"
                    className={hasLoaded ? "" : "hidden"}
                    ref={iframeRef}
                    enable-annotation="true"
                    src={makeIFrameLink(notebookId)}>
                </iframe>
            </Box>
            <Footer marginTop={8} paddingTop={8} marginBottom={8} paddingBottom={8} />
        </Container>
    </>
};

document.addEventListener('DOMContentLoaded', function () {
    const pageProperties = window.pageProperties;
    render(
        <ChakraProvider theme={theme}>
            <View pageProperties={pageProperties} />
        </ChakraProvider>,
        document.getElementById('content')
    )
})
