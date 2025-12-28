// Tool functionality will be implemented here
console.log('Tool loaded');

// Basic file handling
const imageInput = document.getElementById('imageInput');
const uploadBox = document.getElementById('uploadBox');

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('settingsSection').style.display = 'block';
    }
});

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('settingsSection').style.display = 'block';
    }
});

document.getElementById('resetBtn')?.addEventListener('click', () => {
    location.reload();
});
