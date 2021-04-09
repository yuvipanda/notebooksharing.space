const uploadStateNormal = document.getElementById('action-upload-state-normal');
const uploadStateProgress = document.getElementById('action-upload-state-progress');

const UPLOAD_STATES = {
    NORMAL: 1,
    IN_PROGRESS: 2,
}

function setUploadState(state) {
    switch(state) {
        case UPLOAD_STATES.NORMAL:
            uploadStateNormal.classList.remove('hidden');
            uploadStateProgress.classList.add('hidden');
            break;
        case UPLOAD_STATES.IN_PROGRESS:
            uploadStateProgress.classList.remove('hidden');
            uploadStateNormal.classList.add('hidden');
            break;

    }
}

function uploadFile(file) {
    let formData = new FormData();

    formData.append("notebook", file);

    // FIXME: Error handling
    setUploadState(UPLOAD_STATES.IN_PROGRESS);
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

export function setupUpload(uploadButton) {
    const form = document.createElement('form');
    form.action = "/upload";
    form.method = "POST";
    form.enctype= "multipart/form-data";
    form.style.display = 'none';

    const input = document.createElement('input')
    input.accept = ".ipynb";
    input.type = 'file';
    input.name = 'upload';
    form.appendChild(input);

    document.body.appendChild(form);

    uploadButton.addEventListener('click', () => {
        input.click();
    })

    input.addEventListener('change', () => {
        uploadFile(input.files[0]);
    })

}
