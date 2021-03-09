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
        form.submit();
    })

}
