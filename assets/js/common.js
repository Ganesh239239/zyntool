// Common utility functions across all tools

// File size formatter
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Validate image file
function validateImageFile(file, maxSizeMB = 10) {
    if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }

    return true;
}

// Show error message
function showError(message) {
    alert('Error: ' + message);
}

// Create download link
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
