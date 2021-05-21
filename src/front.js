import { Box, ChakraProvider, Container, Flex, GridItem, IconButton, Image, Link, SimpleGrid, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { render } from "react-dom";
import { FaGithub } from "react-icons/fa";
import { Footer } from "./footer";
import logo from "./logo.svg";
import { UploadForm } from './upload';


const ActionItem = ({ number, content, description }) => {
    return <GridItem rowSpan={1} colSpan={2}>
        <Flex flexDirection="row" alignItems="baseline">
            <Text fontSize="2xl" color="gray.600" width={6}>{number}</Text>
            {typeof (content) === 'string' ?
                <Text fontSize="2xl">{content}</Text> :
                content
            }
        </Flex>
        <Text fontSize="md" color="gray.600" marginLeft={6}>{description}</Text>
    </GridItem>
}

const Front = () => {
    return <>

        <Box boxShadow="md">
            <Container maxW='container.lg' paddingTop={4} paddingBottom={2}>
                <Flex direction="row">
                    <Image src={logo} height={8} />
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
            <SimpleGrid columns={{ sm: 3, lg: 5 }} rowGap={8} columnGap={8}>
                <GridItem rowSpan={3} colSpan={3} borderRight="1px solid" borderColor="gray.200">
                    <Text fontSize="6xl">the fastest way to share your notebooks</Text>
                    <Text fontSize="xl" color="gray.400">support jupyter & r markdown notebooks</Text>
                </GridItem>
                <ActionItem number={1} content={
                    <UploadForm size="lg" fontSize={24} padding={8} boxShadow="lg" />
                } />
                <ActionItem number={2} content="Get a link to your notebook" description="The link will permanently point to your notebook" />
                <ActionItem number={3} content="Share the link with anyone!" description="Anyone with the link can view your notebook" />
            </SimpleGrid>
            <Footer showsContent={false} marginTop={72} paddingTop={8} marginBottom={8} />
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
