import React, { useRef, useState } from "react";
import './upload.css';
import { Button, Stack, Tooltip, useDisclosure, Box, Center, Text, HStack } from '@chakra-ui/react';
import { Modal, ModalBody, ModalHeader, ModalCloseButton, ModalOverlay, ModalContent, ModalFooter } from '@chakra-ui/react';
import { FormControl, Spacer, Alert, AlertTitle, AlertDescription, Spinner, AlertIcon, Checkbox, VStack, CloseButton, Link, Icon, Flex, IconButton } from '@chakra-ui/react';
import { BsFileEarmarkText, BsX } from "react-icons/bs";
import { FaFileAlt, FaCreativeCommons, FaCreativeCommonsBy, FaAltQuestionCircle, FaRegQuestionCircle } from "react-icons/fa"
import Dropzone from "react-dropzone";

const FileDisplay = ({ file, setFile, isUploading }) => {
    return <HStack h={36} w="100%" paddingLeft={12} border="dashed 1px" borderColor="gray.400" backgroundColor="green.50">
        {isUploading ? <Spinner w={12} h={12} /> :
            <Icon as={FaFileAlt} w={12} h={12} />
        }
        <Flex direction="column">
            <Text fontSize="lg">{file.name}
                {isUploading ||
                    <IconButton icon={<BsX />} variant="ghost" size="sm" onClick={() => setFile(null)} />}
            </Text>
            <Text fontSize="sm">{file.size} bytes</Text>
        </Flex>
    </HStack >

}

// No files over 10MB
const MAX_ACCEPTED_SIZE_BYTES = 10 * 1024 * 1024;

const UploadDropZone = ({ setSelectedFile }) => {
    const [errorMesssage, setErrorMessage] = useState(null);
    return <VStack width="100%">
        {errorMesssage &&
            <Alert status="error">
                <AlertIcon />
                {errorMesssage}
                <CloseButton position="absolute" right="8px" top="8px" />
            </Alert>
        }
        <Dropzone accept=".ipynb,.py,.md,.Rmd" multiple={false} onDrop={(files) => {
            const file = files[0];
            console.log(file)
            if (file.size > MAX_ACCEPTED_SIZE_BYTES) {
                setErrorMessage(
                    <>
                        <AlertTitle>{file.name}  is too big</AlertTitle>
                        <AlertDescription>Maximum size is 10MB</AlertDescription>
                    </>
                )
            } else {
                setErrorMessage(null)
                setSelectedFile(file);
            }
        }}>
            {({ getRootProps, getInputProps }) => (
                <Center width="100%" height={36} border="dashed 1px" borderColor="gray.400" backgroundColor="gray.50" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Flex direction="column">
                        <Text fontSize="lg">
                            Drag here to upload, or click to select a notebook
                    </Text>
                    </Flex>
                </Center>
            )}
        </Dropzone>
    </VStack>

}
const UploadModal = ({ isOpen, onClose, onOpen }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDiscoverable, setIsDiscoverable] = useState(false);
    const [enableAnnotations, setEnableAnnotations] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    return <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{isUploading ? "Uploading your notebook..." : "Upload your notebook"}</ModalHeader>
            <ModalCloseButton isDisabled={isUploading} colorScheme="teal" />
            <ModalBody>
                <VStack width="100%" spacing={4}>
                    {selectedFile ? <FileDisplay file={selectedFile} setFile={setSelectedFile} isUploading={isUploading} /> : <UploadDropZone setSelectedFile={setSelectedFile} />}
                    <HStack width="100%">
                        <FormControl>
                            <Checkbox colorScheme="teal" isDisabled={isUploading} defaultChecked={isDiscoverable} onChange={(ev) => { setIsDiscoverable(ev.target.checked) }}>
                                Discoverable
                                <Tooltip label="Make this notebook discoverable by search engines" hasArrow>
                                    <span>
                                        <Icon as={FaAltQuestionCircle} width={4} height={4} marginLeft={1} color="gray.400"></Icon>
                                    </span>
                                </Tooltip>
                            </Checkbox>
                        </FormControl>

                        <FormControl>
                            <Checkbox colorScheme="teal" isDisabled={isUploading} onChange={(ev) => { setEnableAnnotations(ev.target.checked) }}>
                                Viewer annotations
                                <Tooltip label="Enable collaborative annotations on this notebook" hasArrow>
                                    <span>
                                        <Icon as={FaAltQuestionCircle} width={4} height={4} marginLeft={1} color="gray.400"></Icon>
                                    </span>
                                </Tooltip>
                            </Checkbox>
                        </FormControl>
                    </HStack>
                    <HStack width="100%" color="gray.400" paddingTop={8}>
                        <Icon as={FaCreativeCommons} height={6} width={6} />
                        <Icon as={FaCreativeCommonsBy} height={6} width={6} />
                        <Text fontSize="sm" color="gray.500">Notebooks will be licensed under a <Link _hover={{ textDecoration: "underline" }} href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution</Link> license, unless otherwise explicitly specified.</Text>
                    </HStack>
                </VStack>

            </ModalBody>

            <ModalFooter>
                <Button colorScheme="teal" mr={3} onClick={() => {
                    const params = {
                        notebook: selectedFile,
                        "enable-discovery": isDiscoverable,
                        "enable-annotations": enableAnnotations
                    }
                    uploadFile(params, setIsUploading);
                }} disabled={!Boolean(selectedFile) || isUploading}>
                    {isUploading ? "Uploading..." : "Upload"}
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal >
}

const UploadForm = ({ ...props }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return <>
        <Button variant="contained" colorScheme="teal" variant="solid" {...props} onClick={onOpen}>Upload your notebook</Button>
        <UploadModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </>;
}

const uploadFile = (params, setIsUploading) => {
    let formData = new FormData();

    Object.keys(params).forEach(key => formData.append(key, params[key]));

    setIsUploading(true)
    // FIXME: Error handling
    fetch('/api/notebook', {
        method: "POST",
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => response.json().then(data => {
            window.location.replace(data['url'])
        }))
}

export { UploadForm };
