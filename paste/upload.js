document.addEventListener("DOMContentLoaded", function(){
    let dialogButton = document.getElementById('paste-UploadButton');
    let dialogClose = document.getElementById('paste-UploadDialog-Close');
    let dialog = document.getElementById('paste-UploadDialog');
    let dialogUpload = document.getElementById('paste-UploadFile');
    let dialogForm = document.getElementById('paste-UploadForm');

    dialogButton.addEventListener('click', () => {
        dialog.classList.remove('paste-Hidden');
    })

    dialogClose.addEventListener('click', () => {
        dialog.classList.add('paste-Hidden');
    })

    dialogUpload.addEventListener('change', () => {
        dialogForm.submit();
    })
});
