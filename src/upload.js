import React, { useRef, useState } from "react";
import './upload.css';
import { Button, Tooltip } from '@chakra-ui/react';
import { QuestionIcon } from "@chakra-ui/icons"

const UploadForm = ({ buttonClassName, buttonNormalLabel }) => {
    const fileUploadRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    return <>
        <form action="/upload" method="POST"
            encType="multipart/form-data"
            style={{ display: 'none' }}
            onChange={() => {
                uploadFile(fileUploadRef.current.files[0], setIsUploading)
            }}
        >
            {/* TODO: Only accept notebook-like formats here. .md supports jupytext*/}
            <input accept=".ipynb,.Rmd,.md" type="file" ref={fileUploadRef}></input>
        </form>
        <Button variant="contained" loadingText="Uploading..."
            isLoading={isUploading} onClick={() => fileUploadRef.current.click()}
            colorScheme="blue" variant="solid">
            {buttonNormalLabel}
        </Button >
    </>;

}

const uploadFile = (file, setIsUploading) => {
    let formData = new FormData();

    formData.append("notebook", file);

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

const LicenseDeclaration = () => {

    return <small className="license-declaration">Notebooks will be licensed under the <abbr title="Creative Commons Attribution License"><a href="https://creativecommons.org/licenses/by/4.0/">CC BY</a></abbr> license&nbsp;
    <Tooltip textAlign="center" hasArrow label="Users are required to provide attribution when they use your notebook">
            <QuestionIcon />
        </Tooltip>
    </small >
}
export { UploadForm, LicenseDeclaration };
