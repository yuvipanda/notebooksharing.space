document.addEventListener("DOMContentLoaded", function(){
    let uploadButton = document.getElementById('action-upload');
    let uploadForm = document.getElementById('upload-form');
    let uploadFileInput = document.getElementById('upload-file');

    uploadButton.addEventListener('click', () => {
        uploadFileInput.click();
    })

    uploadFileInput.addEventListener('change', () => {
        uploadForm.submit();
    })
});
