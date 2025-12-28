// File Handler for Image Processing

class FileHandler {
    constructor() {
        this.currentFile = null;
        this.processedFile = null;
    }

    // Handle file selection
    handleFileSelect(file) {
        if (!this.isValidImageFile(file)) {
            showNotification('Please select a valid image file (JPG, PNG, GIF, WebP)', 'error');
            return false;
        }

        this.currentFile = file;
        return true;
    }

    // Validate image file
    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return file && validTypes.includes(file.type);
    }

    // Read file as Data URL
    readAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    // Load image
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Download file
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Image downloaded successfully!', 'success');
    }
}

// Initialize global file handler
const fileHandler = new FileHandler();