import { render } from "react-dom";
import React from "react";
import './base.css';
import './front.css';

import { CreditFooter } from "./footer";
import { UploadForm, LicenseDeclaration } from './upload';
import { ChakraProvider, Container, Center } from "@chakra-ui/react"

const Front = () => {
    return <>
        <Container maxW='container.lg'>
            <div id="front">
                <h1> ipynb.pub </h1>
                <p>fastest way to publish your jupyter notebooks on the web</p>

                <div id="howto">
                    <ol>
                        <li>
                            <UploadForm buttonNormalLabel="Upload your notebook" />

                            <LicenseDeclaration />
                        </li>
                        <li> Get an immutable link to your notebook </li>
                        <li> Share the link with anyone you want! </li>
                    </ol>

                </div>
            </div>
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
