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

// Tambahkan juga pencarian elemen jika class header2 tidak ditemukan, fallback ke class header
if (!profile) {
    profile = document.querySelector('.header .flex .profile');
}

// Event handler ketika tombol user-btn diklik
document.querySelector('#user-btn').onclick = () => {
    // Jika elemen profile ditemukan (baik di header atau header2)
    if (profile) {
        profile.classList.toggle('active'); // Toggle kelas active untuk memunculkan atau menyembunyikan profile
    }
    
    // Optional: jika Anda menggunakan form pencarian, hapus class 'active' untuk menutup form
    let search = document.querySelector('.header2 .flex .search-form');
    if (search) {
        search.classList.remove('active'); // Menutup form pencarian jika ada
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

// Trigger file input click when upload area is clicked
uploadArea.addEventListener('click', () => {
    if (uploadedFiles.length < 3) {
        fileUploadInput.click(); // Open file dialog if less than 3 files uploaded
    } else {
        alert('Maksimal 3 file'); // Warn user if trying to upload more than 3 files
    }
});

// Highlight upload area when dragging files over it
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault(); // Prevent default behavior
    uploadArea.classList.add('dragover'); // Highlight the area
});

// Remove highlight when dragging leaves
uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover'); // Remove highlight
});

// Handle dropped files
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault(); // Prevent default behavior
    uploadArea.classList.remove('dragover'); // Remove highlight
    if (uploadedFiles.length < 3) { // Allow dropping files only if less than 3 files uploaded
        handleFiles(e.dataTransfer.files); // Process dropped files
    } else {
        alert('Maksimal 3 file'); // Warn if max files are already uploaded
    }
});

// Display the file name when a file is selected
fileUploadInput.addEventListener('change', () => {
    if (uploadedFiles.length < 3) { // Process selected files only if less than 3 files are uploaded
        handleFiles(fileUploadInput.files);
    } else {
        alert('Maksimal 3 file'); // Warn if max files are already uploaded
    }
});

// Function to handle file uploads
function handleFiles(files) {
    for (const file of files) {
        if (uploadedFiles.length < 3) { // Check if the limit is not reached
            const fileType = file.type;
            if (['application/pdf', 
                 'application/msword', 
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                 'image/jpeg', 
                 'image/png'].includes(fileType)) {
                
                uploadedFiles.push(file);
                displayUploadedFile(file.name);
            } else {
                alert('Only PDF, Word, JPG, and PNG files are allowed.'); // Alert for invalid files
            }
        } else {
            alert('You can upload a maximum of 3 files.'); // Alert for maximum files
            break;
        }
    }
    toggleUploadButton(); // Update button state
}

// Function to display uploaded file names
function displayUploadedFile(fileName) {
    const fileItem = document.createElement('div');
    fileItem.classList.add('file-item');
    fileItem.innerHTML = `
        <span>${fileName}</span>
        <button class="remove-file" onclick="removeFile('${fileName}')">x</button>
    `;
    uploadedFilesContainer.appendChild(fileItem);
    fileNameDisplay.textContent = ''; // Clear the single file name display
}

// Function to remove a file from the uploaded list
function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName); // Remove file from array
    toggleUploadButton(); // Update button state
    uploadedFilesContainer.innerHTML = ''; // Clear displayed files
    uploadedFiles.forEach(file => displayUploadedFile(file.name)); // Redisplay remaining files
}

// Function to toggle the upload button and label based on the number of files and textarea input
function toggleUploadButton() {
    const textarea = document.querySelector('textarea'); // Get the textarea
    const hasText = textarea.value.trim().length > 0; // Check if textarea has text
    
    // Enable submit button if there is text in the textarea or if there are uploaded files
    if (uploadedFiles.length <= 3 && (hasText || uploadedFiles.length > 0)) {
        submitButton.disabled = false; // Enable submit button
        uploadLabel.style.display = 'block'; // Show upload label
    } else {
        submitButton.disabled = true; // Disable submit button
        if (uploadedFiles.length >= 3) {
            uploadLabel.style.display = 'none'; // Hide upload label if max files reached
        }
    }

    // Disable drag and drop area and upload button if max files reached
    if (uploadedFiles.length >= 3) {
        uploadArea.style.pointerEvents = 'none'; // Disable drag and drop area
        uploadLabel.style.pointerEvents = 'none'; // Disable upload button
    } else {
        uploadArea.style.pointerEvents = 'auto'; // Enable drag and drop area
        uploadLabel.style.pointerEvents = 'auto'; // Enable upload button
    }
}

// Enable submit button when text is entered in the textarea
document.querySelector('textarea').addEventListener('input', toggleUploadButton);

// Add event listener for the submit button
submitButton.addEventListener('click', () => {
   if (!submitButton.disabled) {
       window.location.href = 'submit-assign.html'; // Redirect to the submission page
   }
});
