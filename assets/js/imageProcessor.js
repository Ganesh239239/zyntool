// Image Processor Core Functions

class ImageProcessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // Compress image
    async compress(image, quality = 0.8) {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.ctx.drawImage(image, 0, 0);

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', quality);
        });
    }

    // Resize image
    async resize(image, width, height, maintainRatio = true) {
        if (maintainRatio) {
            const ratio = Math.min(width / image.width, height / image.height);
            width = image.width * ratio;
            height = image.height * ratio;
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(image, 0, 0, width, height);

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }

    // Rotate image
    async rotate(image, degrees) {
        const radians = (degrees * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        this.canvas.width = image.width * cos + image.height * sin;
        this.canvas.height = image.width * sin + image.height * cos;

        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(radians);
        this.ctx.drawImage(image, -image.width / 2, -image.height / 2);

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }

    // Add watermark
    async addWatermark(image, watermarkText, options = {}) {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.ctx.drawImage(image, 0, 0);

        const fontSize = options.fontSize || 40;
        const color = options.color || 'rgba(255, 255, 255, 0.5)';
        const position = options.position || 'bottom-right';

        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = color;

        const textWidth = this.ctx.measureText(watermarkText).width;
        let x, y;

        switch(position) {
            case 'top-left':
                x = 20;
                y = fontSize + 20;
                break;
            case 'top-right':
                x = this.canvas.width - textWidth - 20;
                y = fontSize + 20;
                break;
            case 'bottom-left':
                x = 20;
                y = this.canvas.height - 20;
                break;
            default: // bottom-right
                x = this.canvas.width - textWidth - 20;
                y = this.canvas.height - 20;
        }

        this.ctx.fillText(watermarkText, x, y);

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }

    // Convert format
    async convert(image, format = 'image/jpeg') {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.ctx.drawImage(image, 0, 0);

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, format, 0.95);
        });
    }
}

// Initialize global image processor
const imageProcessor = new ImageProcessor();