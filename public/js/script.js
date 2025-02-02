document.addEventListener("DOMContentLoaded", () => {
    // Dark Mode Toggle
    let toggleBtn = document.getElementById('toggle-btn');
    let body = document.body;
    let darkMode = localStorage.getItem('dark-mode');

    const enableDarkMode = () => {
        toggleBtn?.classList.replace('fa-sun', 'fa-moon');
        body.classList.add('dark');
        localStorage.setItem('dark-mode', 'enabled');
    };

    const disableDarkMode = () => {
        toggleBtn?.classList.replace('fa-moon', 'fa-sun');
        body.classList.remove('dark');
        localStorage.setItem('dark-mode', 'disabled');
    };

    if (darkMode === 'enabled') {
        enableDarkMode();
    }

    if (toggleBtn) {
        toggleBtn.onclick = () => {
            darkMode = localStorage.getItem('dark-mode');
            darkMode === 'disabled' ? enableDarkMode() : disableDarkMode();
        };
    }

    // Profile Toggle
    let profile = document.querySelector('.header2 .flex .profile') || document.querySelector('.header .flex .profile');
    let userBtn = document.querySelector('#user-btn');
    if (userBtn) {
        userBtn.onclick = () => {
            profile?.classList.toggle('active');
            let search = document.querySelector('.header2 .flex .search-form');
            if (search) search.classList.remove('active');
        };
    }

    // Sidebar Toggle
    let sideBar = document.querySelector('.side-bar');
    let menuBtn = document.querySelector('#menu-btn');
    let closeBtn = document.querySelector('#close-btn');
    if (menuBtn) {
        menuBtn.onclick = () => {
            sideBar?.classList.toggle('active');
            body.classList.toggle('active');
        };
    }
    if (closeBtn) {
        closeBtn.onclick = () => {
            sideBar?.classList.remove('active');
            body.classList.remove('active');
        };
    }

    // Window Scroll Event
    window.onscroll = () => {
        profile?.classList.remove('active');
        let search = document.querySelector('.header2 .flex .search-form');
        search?.classList.remove('active');

        if (window.innerWidth < 1200) {
            sideBar?.classList.remove('active');
            body.classList.remove('active');
        }
    };

    // File Upload Logic - Only if on a page that uses file upload
    const uploadArea = document.getElementById('upload-area');
    const fileUploadInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const uploadedFilesContainer = document.getElementById('uploaded-files');
    const submitButton = document.getElementById('submit-btn');
    const uploadLabel = document.getElementById('upload-label');

    if (uploadArea && fileUploadInput && submitButton) {
        let uploadedFiles = [];

        uploadArea.addEventListener('click', () => {
            if (uploadedFiles.length < 3) fileUploadInput.click();
            else alert('Maksimal 3 file');
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (uploadedFiles.length < 3) handleFiles(e.dataTransfer.files);
            else alert('Maksimal 3 file');
        });

        fileUploadInput.addEventListener('change', () => {
            if (uploadedFiles.length < 3) handleFiles(fileUploadInput.files);
            else alert('Maksimal 3 file');
        });

        function handleFiles(files) {
            for (const file of files) {
                if (uploadedFiles.length < 3) {
                    const fileType = file.type;
                    if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'].includes(fileType)) {
                        uploadedFiles.push(file);
                        displayUploadedFile(file.name);
                    } else {
                        alert('Only PDF, Word, JPG, and PNG files are allowed.');
                    }
                } else {
                    alert('You can upload a maximum of 3 files.');
                    break;
                }
            }
            toggleUploadButton();
        }

        function displayUploadedFile(fileName) {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');
            fileItem.innerHTML = `
                <span>${fileName}</span>
                <button class="remove-file" onclick="removeFile('${fileName}')">x</button>
            `;
            uploadedFilesContainer.appendChild(fileItem);
            fileNameDisplay.textContent = '';
        }

        function removeFile(fileName) {
            uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
            toggleUploadButton();
            uploadedFilesContainer.innerHTML = '';
            uploadedFiles.forEach(file => displayUploadedFile(file.name));
        }

        function toggleUploadButton() {
            const textarea = document.querySelector('textarea');
            const hasText = textarea && textarea.value.trim().length > 0;

            if (uploadedFiles.length <= 3 && (hasText || uploadedFiles.length > 0)) {
                submitButton.disabled = false;
                if (uploadLabel) uploadLabel.style.display = 'block';
            } else {
                submitButton.disabled = true;
                if (uploadLabel && uploadedFiles.length >= 3) uploadLabel.style.display = 'none';
            }

            if (uploadedFiles.length >= 3) {
                uploadArea.style.pointerEvents = 'none';
                if (uploadLabel) uploadLabel.style.pointerEvents = 'none';
            } else {
                uploadArea.style.pointerEvents = 'auto';
                if (uploadLabel) uploadLabel.style.pointerEvents = 'auto';
            }
        }
    }

    // Textarea Input Event
    const textarea = document.querySelector('textarea');
    if (textarea) {
        textarea.addEventListener('input', toggleUploadButton);
    }

    // Submit Button Click Event
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            if (!submitButton.disabled) {
                window.location.href = 'submit-assign.html';
            }
        });
    }
});
