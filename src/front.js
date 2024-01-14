import {
  Box,
  ChakraProvider,
  Container,
  Flex,
  Heading,
  IconButton,
  Image,
  Link,
  Spacer,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { render } from "react-dom";
import { FaGithub } from "react-icons/fa";
import { Footer } from "./footer";
import logo from "./logo.svg";
import theme from "./theme";
import { UploadForm } from "./upload";

const ActionItem = ({ number, content, description }) => {
  return (
    <Box paddingBottom={6}>
      <Flex flexDirection="row" alignItems="baseline">
        <Text fontSize="2xl" color="gray.600" width={6}>
          {number}
        </Text>
        {typeof content === "string" ? (
          <Text fontSize="2xl">{content}</Text>
        ) : (
          content
        )}
      </Flex>
      <Text fontSize="md" color="gray.600" marginLeft={6}>
        {description}
      </Text>
    </Box>
  );
};

const FeatureItem = ({ title, children }) => {
  return (
    <Box flex={1} textAlign="center" padding={4}>
      <Heading fontSize="lg" paddingBottom={2}>
        {title}
      </Heading>
      <Text fontSize="md" color="gray.600">
        {children}
      </Text>
    </Box>
  );
};

const Front = () => {
  return (
    <>
      <Box boxShadow="md">
        <Container maxW="container.lg" paddingTop={4} paddingBottom={2}>
          <Flex direction="row">
            <Image src={logo} height={8} />
            <Spacer />
            <IconButton
              icon={<FaGithub />}
              as={Link}
              href="https://github.com/notebook-sharing-space/nbss"
              variant="ghost"
              fontSize={32}
              title="View repository on GitHub"
              color="gray.200"
              _hover={{ color: "black" }}
            />
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.lg" marginTop={12}>
        <Flex flexDir="column">
          <Flex flexDir={{ base: "column", md: "row" }}>
            <Box borderRight="1px solid" borderColor="gray.200" flex={3}>
              <Heading fontSize="6xl" fontWeight="normal">
                the fastest way to share your notebooks
              </Heading>
            </Box>
            <Flex flexDir="column" paddingLeft={4} flex={2}>
              <ActionItem
                number={1}
                content={
                  <UploadForm
                    size="lg"
                    fontSize={24}
                    padding={8}
                    boxShadow="lg"
                  />
                }
              />
              <ActionItem
                number={2}
                content="Get a link to your notebook"
                description="The link will permanently point to your notebook"
              />
              <ActionItem
                number={3}
                content="Share the link with anyone!"
                description="Anyone with the link can view your notebook"
              />
            </Flex>
          </Flex>

          <Flex
            direction={{ base: "column", md: "row" }}
            marginTop={8}
            paddingTop={4}
            borderTop="0px solid"
            borderTopColor="gray.200"
          >
            <FeatureItem title="❤️ Jupyter & R Markdown">
              Upload and share both Jupyter (<code>.ipynb</code>) and R (
              <code>.rmd</code>, <code>.html</code>) notebooks.
            </FeatureItem>
            <FeatureItem title="️️✍️ Annotate your notebook">
              Opt-in to annotations and highlights on your notebook with
              built-in <a href="https://web.hypothes.is/">hypothes.is</a>{" "}
              support.
            </FeatureItem>
            <FeatureItem title="🔒 Private by default">
              Only people who have the link can see the notebook by default -
              search engines cannot.
            </FeatureItem>
          </Flex>

          <Footer
            paddingTop={8}
            marginTop={24}
            marginBottom={8}
            textAlign="center"
          />
        </Flex>
      </Container>
    </>
  );
};

document.addEventListener("DOMContentLoaded", function () {
  render(
    <ChakraProvider theme={theme}>
      <Front />
    </ChakraProvider>,
    document.getElementById("content"),
  );
});
