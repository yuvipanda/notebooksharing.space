import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Center, Checkbox, CloseButton, Flex, FormControl, HStack, Icon, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Text, Tooltip, useDisclosure, VStack } from '@chakra-ui/react';
import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { BsX } from "react-icons/bs";
import { FaAltQuestionCircle, FaFileAlt } from "react-icons/fa";

const FileDisplay = ({ file, setFile, isUploading, setErrorMessage }) => {
    return <HStack h={36} w="100%" paddingLeft={12} border="dashed 1px" borderColor="gray.400" backgroundColor="green.50">
        {isUploading ? <Spinner w={12} h={12} /> :
            <Icon as={FaFileAlt} w={12} h={12} />
        }
        <Flex direction="column">
            <Text fontSize="lg">{file.name}
                {isUploading ||
                    <IconButton icon={<BsX />} variant="ghost" size="sm" onClick={() => {
                        setFile(null);
                        setErrorMessage(null);
                    }} />}
            </Text>
            <Text fontSize="sm">{file.size} bytes</Text>
        </Flex>
    </HStack >

}

// No files over 10MB
const MAX_ACCEPTED_SIZE_BYTES = 10 * 1024 * 1024;

const UploadDropZone = ({ setSelectedFile, setErrorMessage }) => {
    return <Dropzone accept=".ipynb,.py,.md,.Rmd,.html" multiple={false} onDrop={(files) => {
        const file = files[0];
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

}
const UploadModal = ({ isOpen, onClose, onOpen }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDiscoverable, setIsDiscoverable] = useState(false);
    const [enableAnnotations, setEnableAnnotations] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [errorMesssage, setErrorMessage] = useState(null);
    return <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{isUploading ? "Uploading your notebook..." : "Upload your notebook"}</ModalHeader>
            <ModalCloseButton isDisabled={isUploading} colorScheme="orange" />
            <ModalBody>
                <VStack width="100%" spacing={4}>
                    {errorMesssage &&
                        <Alert status="error">
                            <AlertIcon />
                            {errorMesssage}
                            <CloseButton position="absolute" right="8px" top="8px" onClick={() => setErrorMessage(null)} />
                        </Alert>
                    }
                    {selectedFile ?
                        <FileDisplay file={selectedFile} setFile={setSelectedFile} isUploading={isUploading} setErrorMessage={setErrorMessage} /> :
                        <UploadDropZone setSelectedFile={setSelectedFile} setErrorMessage={setErrorMessage} />
                    }
                    <HStack width="100%">
                        <FormControl>
                            <Checkbox colorScheme="orange" isDisabled={isUploading} defaultChecked={isDiscoverable} onChange={(ev) => { setIsDiscoverable(ev.target.checked) }}>
                                Discoverable
                                <Tooltip label="Make this notebook discoverable by search engines" hasArrow>
                                    <span>
                                        <Icon as={FaAltQuestionCircle} width={4} height={4} marginLeft={1} color="gray.400"></Icon>
                                    </span>
                                </Tooltip>
                            </Checkbox>
                        </FormControl>

                        <FormControl>
                            <Checkbox colorScheme="orange" isDisabled={isUploading} onChange={(ev) => { setEnableAnnotations(ev.target.checked) }}>
                                Enable annotations
                                <Tooltip label="Enable collaborative annotations on this notebook" hasArrow>
                                    <span>
                                        <Icon as={FaAltQuestionCircle} width={4} height={4} marginLeft={1} color="gray.400"></Icon>
                                    </span>
                                </Tooltip>
                            </Checkbox>
                        </FormControl>
                    </HStack>
                </VStack>

            </ModalBody>

            <ModalFooter>
                <Button colorScheme="orange" mr={3} onClick={() => {
                    const params = {
                        notebook: selectedFile,
                        "enable-discovery": isDiscoverable,
                        "enable-annotations": enableAnnotations
                    }
                    uploadFile(params, setIsUploading, setErrorMessage);
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
        <Button variant="contained" colorScheme="orange" variant="solid" {...props} onClick={onOpen}>Upload your notebook</Button>
        <UploadModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </>;
}

const uploadFile = (params, setIsUploading, setErrorMessage) => {
    let formData = new FormData();

    Object.keys(params).forEach(key => formData.append(key, params[key]));

    setIsUploading(true)
    // When we're uploading, we aren't in error state yet!
    setErrorMessage(null);

    fetch('/api/v1/notebook', {
        method: "POST",
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            response.text().then(text => setErrorMessage(text))
            setIsUploading(false)
        } else {
            response.json().then(data => {
                window.location.replace(data['url'])
            }).catch(err => {
                setErrorMessage(String(err));
                setIsUploading(false)
            })
        }
    }).catch(err => {
        setErrorMessage(String(err))
        setIsUploading(false)
    })
}

export { UploadForm };
