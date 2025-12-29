/**
 * Image Cropping Tool
 * Provides functionality for cropping images with selection rectangle
 */

class ImageCropper {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.image = null;
    this.startX = 0;
    this.startY = 0;
    this.isDrawing = false;
    this.cropRect = { x: 0, y: 0, width: 0, height: 0 };
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.initEventListeners();
  }

  /**
   * Initialize event listeners for canvas interactions
   */
  initEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('mouseout', (e) => this.handleMouseUp(e));
    
    // Touch support for mobile devices
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  /**
   * Load an image file
   * @param {File} file - Image file to load
   */
  loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.image = img;
          this.fitImageToCanvas();
          this.redraw();
          resolve(img);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Load an image from URL
   * @param {string} url - Image URL
   */
  loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.image = img;
        this.fitImageToCanvas();
        this.redraw();
        resolve(img);
      };
      
      img.onerror = () => reject(new Error('Failed to load image from URL'));
      img.src = url;
    });
  }

  /**
   * Fit image to canvas while maintaining aspect ratio
   */
  fitImageToCanvas() {
    if (!this.image) return;

    const maxWidth = this.canvas.width;
    const maxHeight = this.canvas.height;
    
    let width = this.image.width;
    let height = this.image.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    this.scale = width / this.image.width;
    this.offsetX = (this.canvas.width - width) / 2;
    this.offsetY = (this.canvas.height - height) / 2;
  }

  /**
   * Handle mouse down event
   */
  handleMouseDown(e) {
    if (!this.image) return;

    const rect = this.canvas.getBoundingClientRect();
    this.startX = (e.clientX - rect.left - this.offsetX) / this.scale;
    this.startY = (e.clientY - rect.top - this.offsetY) / this.scale;
    this.isDrawing = true;
  }

  /**
   * Handle mouse move event
   */
  handleMouseMove(e) {
    if (!this.isDrawing || !this.image) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left - this.offsetX) / this.scale;
    const currentY = (e.clientY - rect.top - this.offsetY) / this.scale;

    this.cropRect.x = Math.min(this.startX, currentX);
    this.cropRect.y = Math.min(this.startY, currentY);
    this.cropRect.width = Math.abs(currentX - this.startX);
    this.cropRect.height = Math.abs(currentY - this.startY);

    // Constrain crop rectangle to image bounds
    this.constrainCropRect();
    this.redraw();
  }

  /**
   * Handle mouse up event
   */
  handleMouseUp(e) {
    this.isDrawing = false;
  }

  /**
   * Handle touch start event
   */
  handleTouchStart(e) {
    if (!this.image) return;

    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.startX = (touch.clientX - rect.left - this.offsetX) / this.scale;
    this.startY = (touch.clientY - rect.top - this.offsetY) / this.scale;
    this.isDrawing = true;
    e.preventDefault();
  }

  /**
   * Handle touch move event
   */
  handleTouchMove(e) {
    if (!this.isDrawing || !this.image) return;

    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const currentX = (touch.clientX - rect.left - this.offsetX) / this.scale;
    const currentY = (touch.clientY - rect.top - this.offsetY) / this.scale;

    this.cropRect.x = Math.min(this.startX, currentX);
    this.cropRect.y = Math.min(this.startY, currentY);
    this.cropRect.width = Math.abs(currentX - this.startX);
    this.cropRect.height = Math.abs(currentY - this.startY);

    this.constrainCropRect();
    this.redraw();
    e.preventDefault();
  }

  /**
   * Handle touch end event
   */
  handleTouchEnd(e) {
    this.isDrawing = false;
  }

  /**
   * Constrain crop rectangle to image bounds
   */
  constrainCropRect() {
    if (this.cropRect.x < 0) this.cropRect.x = 0;
    if (this.cropRect.y < 0) this.cropRect.y = 0;
    
    if (this.cropRect.x + this.cropRect.width > this.image.width) {
      this.cropRect.width = this.image.width - this.cropRect.x;
    }
    
    if (this.cropRect.y + this.cropRect.height > this.image.height) {
      this.cropRect.height = this.image.height - this.cropRect.y;
    }
  }

  /**
   * Redraw canvas with image and crop selection
   */
  redraw() {
    // Clear canvas
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.image) return;

    // Draw image
    const displayX = this.offsetX;
    const displayY = this.offsetY;
    const displayWidth = this.image.width * this.scale;
    const displayHeight = this.image.height * this.scale;

    this.ctx.drawImage(this.image, displayX, displayY, displayWidth, displayHeight);

    // Draw crop selection
    if (this.cropRect.width > 0 && this.cropRect.height > 0) {
      this.drawCropSelection();
    }
  }

  /**
   * Draw crop selection rectangle and handles
   */
  drawCropSelection() {
    const x = this.offsetX + this.cropRect.x * this.scale;
    const y = this.offsetY + this.cropRect.y * this.scale;
    const width = this.cropRect.width * this.scale;
    const height = this.cropRect.height * this.scale;

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Clear crop area
    this.ctx.clearRect(x, y, width, height);

    // Draw border
    this.ctx.strokeStyle = '#00bcd4';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Draw grid lines
    this.drawGridLines(x, y, width, height);

    // Draw corner handles
    this.drawHandles(x, y, width, height);
  }

  /**
   * Draw grid lines for rule of thirds
   */
  drawGridLines(x, y, width, height) {
    this.ctx.strokeStyle = 'rgba(0, 188, 212, 0.3)';
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 1; i < 3; i++) {
      const lineX = x + (width / 3) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let i = 1; i < 3; i++) {
      const lineY = y + (height / 3) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }
  }

  /**
   * Draw corner and edge handles
   */
  drawHandles(x, y, width, height) {
    const handleSize = 8;
    this.ctx.fillStyle = '#00bcd4';

    // Corner handles
    const corners = [
      [x, y],
      [x + width, y],
      [x, y + height],
      [x + width, y + height]
    ];

    corners.forEach(([hx, hy]) => {
      this.ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
    });

    // Edge handles
    const edges = [
      [x + width / 2, y],
      [x + width / 2, y + height],
      [x, y + height / 2],
      [x + width, y + height / 2]
    ];

    edges.forEach(([hx, hy]) => {
      this.ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
    });
  }

  /**
   * Get cropped image as canvas
   * @returns {HTMLCanvasElement} Canvas containing cropped image
   */
  getCroppedCanvas() {
    if (!this.image || this.cropRect.width === 0 || this.cropRect.height === 0) {
      throw new Error('No valid crop selection');
    }

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = this.cropRect.width;
    croppedCanvas.height = this.cropRect.height;

    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.drawImage(
      this.image,
      this.cropRect.x,
      this.cropRect.y,
      this.cropRect.width,
      this.cropRect.height,
      0,
      0,
      this.cropRect.width,
      this.cropRect.height
    );

    return croppedCanvas;
  }

  /**
   * Get cropped image as blob
   * @param {string} format - Image format (jpg, png, etc.)
   * @param {number} quality - Quality for JPEG (0-1)
   * @returns {Promise<Blob>} Promise resolving to image blob
   */
  getCroppedBlob(format = 'png', quality = 0.9) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = this.getCroppedCanvas();
        const mimeType = `image/${format}`;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Download cropped image
   * @param {string} filename - Output filename
   * @param {string} format - Image format
   */
  async downloadCropped(filename = 'cropped-image.png', format = 'png') {
    try {
      const blob = await this.getCroppedBlob(format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  /**
   * Set crop rectangle manually
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   */
  setCropRect(x, y, width, height) {
    this.cropRect = { x, y, width, height };
    this.constrainCropRect();
    this.redraw();
  }

  /**
   * Get current crop rectangle
   * @returns {Object} Crop rectangle object
   */
  getCropRect() {
    return { ...this.cropRect };
  }

  /**
   * Reset crop selection
   */
  resetCrop() {
    this.cropRect = { x: 0, y: 0, width: 0, height: 0 };
    this.redraw();
  }

  /**
   * Clear canvas and image
   */
  clear() {
    this.image = null;
    this.cropRect = { x: 0, y: 0, width: 0, height: 0 };
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageCropper;
}
