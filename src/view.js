import { ChevronDownIcon, DownloadIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  ChakraProvider,
  Container,
  Flex,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spacer,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { iframeResize } from "iframe-resizer";
import querystring from "querystring";
import React, { useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import { Footer } from "./footer";
import logo from "./logo.svg";
import { MESSAGE_TYPES, parseMessage, postMessage } from "./messages";
import theme from "./theme";
import { UploadForm } from "./upload";

const makeDownloadLink = (notebookId) => {
  return "/api/v1/notebook/" + notebookId;
};

const makeJupyterLiteLink = (notebookId, filename) => {
  // The trailing slash after / is important, as it triggers the index.html behavior from
  // starlette's Static file serving.
  return `/jupyterlite/notebooks/?fromURL=/api/v1/notebook/${notebookId}/${filename}`;
};

const makeIFrameLink = (notebookId) => {
  // FIXME This is not safe
  // Incrememnt cache version here whenever we make a change in HTML
  // structure of the rendered notebook.
  return "/render/v1/" + notebookId + "?cacheVersion=2";
};

const updateFragmentOptions = (options) => {
  let loc = new URL(window.location);
  const fragmentParams = querystring.parse(
    window.location.hash.replace(/^#/, ""),
  );
  fragmentParams.displayOptions = options.join("|");
  loc.hash = querystring.stringify(fragmentParams);
  history.pushState({}, "", loc);
};

const getDisplayOptions = () => {
  const fragmentOptions = querystring.parse(
    window.location.hash.replace(/^#/, ""),
  );
  if (fragmentOptions.displayOptions) {
    return fragmentOptions.displayOptions.split("|");
  }
  return [];
};

const NotebookOptions = ({
  iframeRef,
  notebookId,
  hasFrameLoaded,
  ...props
}) => {
  const availableDisplayOptions = {
    "hide-inputs": "Hide code cells",
    "show-linenos": "Show line numbers",
  };
  const [displayOptions, setDisplayOptions] = useState(getDisplayOptions());

  useEffect(() => {
    postMessage(
      iframeRef.current.contentWindow,
      MESSAGE_TYPES.SET_DISPLAY_OPTIONS,
      {
        availableDisplayOptions: availableDisplayOptions,
        selectedDisplayOptions: displayOptions,
      },
    );
    updateFragmentOptions(displayOptions);
  }, [displayOptions]);

  useEffect(() => {
    // FIXME: Fix this duplication
    postMessage(
      iframeRef.current.contentWindow,
      MESSAGE_TYPES.SET_DISPLAY_OPTIONS,
      {
        availableDisplayOptions: availableDisplayOptions,
        selectedDisplayOptions: displayOptions,
      },
    );
  }, [hasFrameLoaded]);

  return (
    <Menu {...props}>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="ghost"
        size="sm"
        fontWeight={200}
      >
        Display Options
      </MenuButton>

      <MenuList>
        <MenuOptionGroup
          type="checkbox"
          onChange={setDisplayOptions}
          value={displayOptions}
        >
          {Object.keys(availableDisplayOptions).map((option) => {
            return (
              <MenuItemOption value={option} key={option}>
                {availableDisplayOptions[option]}
              </MenuItemOption>
            );
          })}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};

const ContentHeader = ({
  filename,
  notebookId,
  notebookFormat,
  iframeRef,
  hasFrameLoaded,
  ...props
}) => {
  return (
    <Flex alignItems="baseline" {...props}>
      <Text fontSize="xl" fontWeight={300}>
        {filename}

        <IconButton
          variant="ghost"
          size="md"
          color="gray.400"
          // Try make the icon look exactly in line with baseline of text
          marginLeft={2}
          marginTop={-2}
          width={4}
          height={4}
          display="inline-block"
          _hover={{ textDecoration: "none", color: "black" }}
          title="Download notebook"
          icon={<DownloadIcon />}
          as={Link}
          href={makeDownloadLink(notebookId)}
        >
          Download notebook
        </IconButton>
        <Button
          size="sm"
          marginLeft={-4}
          colorScheme="gray"
          as={Link}
          href={makeJupyterLiteLink(notebookId, filename)}
          _hover={{ textDecoration: "none" }}
        >
          Open in JupyterLite
        </Button>
      </Text>

      <Spacer />

      {/* None of these options really work on R HTML notebooks,
            so let's hide the notebook options bar to not confuse users.
            Plus, R HTML notebooks have their own dropdown to hide cells - so
            the decision is made to hide this menu, rather than disable it.
        */}
      {notebookFormat !== "html" && (
        <NotebookOptions
          iframeRef={iframeRef}
          notebookFormat={notebookFormat}
          notebookId={notebookId}
          hasFrameLoaded={hasFrameLoaded}
          color="black"
        />
      )}
    </Flex>
  );
};

const View = ({ pageProperties }) => {
  const notebookId = pageProperties.id;
  const [hasLoaded, setHasLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    // Can't connect to DOMContentLoaded of iframe from parent, so
    // we explicitly listen for a message from child instead.
    window.addEventListener("message", (event) => {
      const data = parseMessage(event);
      if (data && data.type == MESSAGE_TYPES.FRAME_DOM_CONTENT_LOADED) {
        setHasLoaded(true);
        iframeResize({ checkOrigin: false }, iframeRef.current);
        postMessage(
          iframeRef.current.contentWindow,
          MESSAGE_TYPES.LOAD_HYPOTHESIS,
          {},
        );
        // FIXME: Remove this event listener
      }
    });
  }, []);

  return (
    <>
      <Box>
        <Container maxW="container.lg">
          <Flex alignItems="top" paddingBottom={4} paddingTop={4}>
            <Flex direction="column" alignItems="baseline">
              <Link _hover={{ textDecoration: "none" }} href="/" marginTop={1}>
                <Image src={logo} height={8} />
              </Link>
              <Text fontSize="md" marginTop={1}>
                the fastest way to share your notebooks
              </Text>
            </Flex>
            <Spacer />
            <UploadForm size="lg" />
          </Flex>
        </Container>
      </Box>

      <Container
        maxW="container.lg"
        boxShadow="0px 0px 12px -4px #939393"
        marginTop={6}
        marginBottom={8}
      >
        <ContentHeader
          filename={pageProperties.filename}
          notebookId={notebookId}
          notebookFormat={pageProperties.format}
          iframeRef={iframeRef}
          hasFrameLoaded={hasLoaded}
          paddingLeft={8}
          paddingRight={1}
          paddingTop={4}
          paddingBottom={4}
          borderBottom="1px dotted"
          borderBottomColor="gray.400"
        />
        <Box padding={2} paddingLeft={6} minHeight={128}>
          {hasLoaded || (
            <Center>
              <Spinner color="orange" size="xl" />
            </Center>
          )}
          <iframe
            width="100%"
            className={hasLoaded ? "" : "hidden"}
            ref={iframeRef}
            enable-annotation="true"
            src={makeIFrameLink(notebookId)}
          ></iframe>
        </Box>
        <Footer
          marginTop={8}
          paddingTop={8}
          marginBottom={8}
          paddingBottom={8}
        />
      </Container>
    </>
  );
};

document.addEventListener("DOMContentLoaded", function () {
  const pageProperties = window.pageProperties;
  render(
    <ChakraProvider theme={theme}>
      <View pageProperties={pageProperties} />
    </ChakraProvider>,
    document.getElementById("content"),
  );
});
