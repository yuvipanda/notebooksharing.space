import { render } from "react-dom";
import React from "react";
import './base.css';

import { CreditFooter } from "./footer";
import { UploadForm } from './upload';
import { ChakraProvider, Container, Center, Image, Link, Text, Box, Flex, Grid, GridItem, HStack, Spacer, IconButton } from "@chakra-ui/react"
import { FaGithub } from "react-icons/fa"
import logo from "./logo.svg";

const ActionItem = ({ number, content, description }) => {
    return <GridItem rowSpan={1} colSpan={2}>
        <Flex flexDirection="row" alignItems="baseline">
            <Text fontSize="2xl" color="gray.400" width={6}>{number}</Text>
            {typeof (content) === 'string' ?
                <Text fontSize="2xl">{content}</Text> :
                content
            }
        </Flex>
        <Text fontSize="md" color="gray.500" marginLeft={6}>{description}</Text>
    </GridItem>

}
const Front = () => {
    return <>

        <Box boxShadow="md">
            <Container maxW='container.lg' paddingTop={4} paddingBottom={4}>
                <Flex direction="row">
                    <Image src={logo} width="sm" />
                    <Spacer />
                    <IconButton icon={<FaGithub />}
                        as={Link}
                        href="https://github.com/notebook-sharing-space/ipynb.pub"
                        variant="ghost"
                        fontSize={32}
                        title="View repository on GitHub"
                        color="gray.200" _hover={{ color: "black" }} />
                </Flex>
            </Container>
        </Box>
        <Container maxW='container.lg' marginTop={12}>
            <Grid templateColumns="repeat(5, 1fr)" rowGap={8} columnGap={8}>
                <GridItem rowSpan={3} colSpan={3} borderRight="1px solid" borderColor="gray.200">
                    <Text fontSize="6xl">the fastest way to share your notebooks</Text>
                </GridItem>
                <ActionItem number={1} content={
                    <UploadForm size="lg" fontSize={24} padding={8} boxShadow="lg" />
                } />
                <ActionItem number={2} content="Get a link to your notebook" description="The link will permanently point to your notebook" />
                <ActionItem number={3} content="Share the link with anyone!" description="Anyone with the link can view your notebook" />
            </Grid>
            <Center>
                <footer className="sticky">
                    <CreditFooter />
                </footer>
            </Center>
        </Container>
    </>;

}

document.addEventListener('DOMContentLoaded', function () {

    render(
        <ChakraProvider>
            <Front />
        </ChakraProvider>,
        document.getElementById("content")
    );
})
