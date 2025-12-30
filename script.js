// Function to switch between Home Grid and Tool Upload View
function openTool(toolName) {
    const mainView = document.getElementById('main-view');
    const uploadView = document.getElementById('upload-view');
    const toolTitle = document.getElementById('tool-title');

    // Update Title
    toolTitle.innerText = toolName;

    // Switch Views
    mainView.classList.add('d-none');
    uploadView.classList.remove('d-none');
}

function closeTool() {
    const mainView = document.getElementById('main-view');
    const uploadView = document.getElementById('upload-view');

    mainView.classList.remove('d-none');
    uploadView.classList.add('d-none');
}

// File Input Listener
document.getElementById('fileInput').addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        alert(`${e.target.files.length} images selected. Next step: Processing...`);
        // Here you would add logic to send files to a processing backend
    }
});

// Dropdown interaction (Optional helper if CSS hover isn't enough)
document.getElementById('all-tools-trigger').addEventListener('mouseenter', () => {
    document.getElementById('tools-dropdown').style.display = 'block';
});
