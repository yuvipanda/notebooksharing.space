document.addEventListener("DOMContentLoaded", function(){
    let dialogButton = document.getElementById('paste-UploadButton');
    let dialogUpload = document.getElementById('paste-UploadFile');
    let dialogForm = document.getElementById('paste-UploadForm');

    dialogButton.addEventListener('click', () => {
        dialogUpload.click();
    })

    dialogUpload.addEventListener('change', () => {
        dialogForm.submit();
    })
});
