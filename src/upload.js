import React, { useRef, useState } from "react";
import './upload.css';
import { Button, Stack, Tooltip, useDisclosure, Box, Center, Text, HStack } from '@chakra-ui/react';
import { Modal, ModalBody, ModalHeader, ModalCloseButton, ModalOverlay, ModalContent, ModalFooter } from '@chakra-ui/react';
import { FormControl, FormLabel, Input, FormHelperText, Checkbox, VStack, StackDivider, Link, Icon, Flex, IconButton } from '@chakra-ui/react';
import { BsFileEarmarkText, BsX } from "react-icons/bs";
import { FaFileAlt, FaCreativeCommons, FaCreativeCommonsBy } from "react-icons/fa"
import Dropzone from "react-dropzone";

const FileDisplay = ({ file, setFile }) => {
    return <HStack h={36} w="100%" paddingLeft={12} border="dashed 1px" borderColor="gray.400" backgroundColor="green.50">
        <Icon as={FaFileAlt} w={12} h={12} />
        <Flex direction="column">
            <Text fontSize="lg">{file.name}
                <IconButton icon={<BsX />} variant="ghost" size="sm" onClick={() => setFile(null)} />
            </Text>
            <Text fontSize="sm">{file.size} bytes</Text>
        </Flex>
    </HStack >

}

const UploadDropZone = ({ setSelectedFile }) => {
    return <Dropzone accept=".ipynb,.py,.md,.Rmd" multiple={false} onDrop={(acceptedFiles) => {
        setSelectedFile(acceptedFiles[0]);
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
    const [shouldIndex, setShouldIndex] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    return <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Upload your notebook</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <VStack width="100%" spacing={4}>
                    {selectedFile ? <FileDisplay file={selectedFile} setFile={setSelectedFile} /> : <UploadDropZone setSelectedFile={setSelectedFile} />}
                    <FormControl id="enableIndexing">
                        <Checkbox onChange={(ev) => { setShouldIndex(ev.target.checked) }}>
                            Allow search engines to index this notebook
                        </Checkbox>
                    </FormControl>

                    <HStack width="100%" color="gray.400" paddingTop={8}>
                        <Icon as={FaCreativeCommons} height={6} width={6} />
                        <Icon as={FaCreativeCommonsBy} height={6} width={6} />
                        <Text fontSize="sm" color="gray.500">Notebooks will be licensed under a <Link _hover={{ textDecoration: "underline" }} href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution</Link> license, unless otherwise explicitly specified.</Text>
                    </HStack>
                </VStack>

            </ModalBody>

            <ModalFooter>
                <Button colorScheme="blue" mr={3} isLoading={isUploading} onClick={() => {
                    const params = {
                        notebook: selectedFile,
                        shouldIndex: shouldIndex
                    }
                    uploadFile(params, setIsUploading);
                }} disabled={!Boolean(selectedFile)}>
                    Upload
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal >
}

const UploadForm = ({ buttonNormalLabel }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return <>
        <Button variant="contained" colorScheme="blue" variant="solid" onClick={onOpen}>Upload your notebook</Button>
        <UploadModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </>;
}

const uploadFile = (params, setIsUploading) => {
    let formData = new FormData();

    Object.keys(params).forEach(key => formData.append(key, params[key]));

    setIsUploading(true)
    // FIXME: Error handling
    fetch('/upload', {
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
