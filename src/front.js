import 'bootstrap/dist/css/bootstrap.min.css';
import './base.css';
import './front.css';

import { setupUpload } from './upload';


document.addEventListener('DOMContentLoaded', function() {
    let uploadButton = document.getElementById('action-upload');
    setupUpload(uploadButton);
})
