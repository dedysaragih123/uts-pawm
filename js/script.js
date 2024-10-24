let toggleBtn = document.getElementById('toggle-btn');
let body = document.body;
let darkMode = localStorage.getItem('dark-mode');

const enableDarkMode = () =>{
   toggleBtn.classList.replace('fa-sun', 'fa-moon');
   body.classList.add('dark');
   localStorage.setItem('dark-mode', 'enabled');
}

const disableDarkMode = () =>{
   toggleBtn.classList.replace('fa-moon', 'fa-sun');
   body.classList.remove('dark');
   localStorage.setItem('dark-mode', 'disabled');
}

if(darkMode === 'enabled'){
   enableDarkMode();
}

toggleBtn.onclick = (e) =>{
   darkMode = localStorage.getItem('dark-mode');
   if(darkMode === 'disabled'){
      enableDarkMode();
   }else{
      disableDarkMode();
   }
}

let profile = document.querySelector('.header2 .flex .profile');

if (!profile) {
    profile = document.querySelector('.header .flex .profile');
}

document.querySelector('#user-btn').onclick = () => {
    if (profile) {
        profile.classList.toggle('active'); 
    }
    
    let search = document.querySelector('.header2 .flex .search-form');
    if (search) {
        search.classList.remove('active'); 
    }
};

let sideBar = document.querySelector('.side-bar');

document.querySelector('#menu-btn').onclick = () =>{
   sideBar.classList.toggle('active');
   body.classList.toggle('active');
}

document.querySelector('#close-btn').onclick = () =>{
   sideBar.classList.remove('active');
   body.classList.remove('active');
}

window.onscroll = () =>{
   profile.classList.remove('active');
   search.classList.remove('active');

   if(window.innerWidth < 1200){
      sideBar.classList.remove('active');
      body.classList.remove('active');
   }
}

const uploadArea = document.getElementById('upload-area');
const fileUploadInput = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const uploadedFilesContainer = document.getElementById('uploaded-files');
const submitButton = document.getElementById('submit-btn');
const uploadLabel = document.getElementById('upload-label');

let uploadedFiles = [];


uploadArea.addEventListener('click', () => {
    if (uploadedFiles.length < 3) {
        fileUploadInput.click(); 
    } else {
        alert('Maksimal 3 file'); 
    }
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
    if (uploadedFiles.length < 3) { 
        handleFiles(e.dataTransfer.files); 
    } else {
        alert('Maksimal 3 file'); 
    }
});

fileUploadInput.addEventListener('change', () => {
    if (uploadedFiles.length < 3) { 
        handleFiles(fileUploadInput.files);
    } else {
        alert('Maksimal 3 file'); 
    }
});

function handleFiles(files) {
    for (const file of files) {
        if (uploadedFiles.length < 3) { 
            const fileType = file.type;
            if (['application/pdf', 
                 'application/msword', 
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                 'image/jpeg', 
                 'image/png'].includes(fileType)) {
                
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
    const hasText = textarea.value.trim().length > 0; 
    
    if (uploadedFiles.length <= 3 && (hasText || uploadedFiles.length > 0)) {
        submitButton.disabled = false; 
        uploadLabel.style.display = 'block'; 
    } else {
        submitButton.disabled = true; 
        if (uploadedFiles.length >= 3) {
            uploadLabel.style.display = 'none'; 
        }
    }

    if (uploadedFiles.length >= 3) {
        uploadArea.style.pointerEvents = 'none'; 
        uploadLabel.style.pointerEvents = 'none'; 
    } else {
        uploadArea.style.pointerEvents = 'auto'; 
        uploadLabel.style.pointerEvents = 'auto'; 
    }
}

document.querySelector('textarea').addEventListener('input', toggleUploadButton);

submitButton.addEventListener('click', () => {
   if (!submitButton.disabled) {
       window.location.href = 'submit-assign.html'; 
   }
});
