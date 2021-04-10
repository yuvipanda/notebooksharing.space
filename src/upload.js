import React, { useRef, useState } from "react";
import './upload.css';

const UPLOAD_STATUS = {
    NORMAL: 1,
    IN_PROGRESS: 2,
    FAILED: 3,
    COMPLETED: 4
}

const UploadForm = ({ buttonClassName }) => {
    const fileUploadRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState(UPLOAD_STATUS.NORMAL);
    return <>
        <form action="/upload" method="POST"
            encType="multipart/form-data"
            style={{ display: 'none' }}
            onChange={() => {
                uploadFile(fileUploadRef.current.files[0], setUploadStatus)
            }}
        >
            <input accept=".ipynb" type="file" ref={fileUploadRef}></input>
        </form>
        <UploadButton className={buttonClassName} uploadStatus={uploadStatus} onClick={() => fileUploadRef.current.click()} />
    </>;

}
const UploadButton = ({ onClick, uploadStatus, className }) => {
    const classNames = "btn btn-primary upload-button " + className;
    switch (uploadStatus) {
        case UPLOAD_STATUS.NORMAL:
            return <button className={classNames} tabIndex="0" onClick={onClick}>
                Upload your notebook
            </button >
        case UPLOAD_STATUS.IN_PROGRESS:
            return <button className={classNames} disabled>
                Uploading...
                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
            </button>
        case UPLOAD_STATUS.COMPLETED:
            return <button className={classNames} disabled>
                Redirecting...
            </button>
    }
}

const uploadFile = (file, setUploadStatus) => {
    let formData = new FormData();

    formData.append("notebook", file);

    setUploadStatus(UPLOAD_STATUS.IN_PROGRESS);
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
