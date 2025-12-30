export default class CoreUploader {
  constructor({ dropZone, input, onFiles }) {
    this.dropZone = dropZone;
    this.input = input;
    this.onFiles = onFiles;
    this.files = [];

    this.init();
  }

  init() {
    this.dropZone.addEventListener('click', () => this.input.click());

    this.input.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('dragover');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('dragover');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });
  }

  handleFiles(fileList) {
    this.files = Array.from(fileList).map(file => ({
      file,
      url: URL.createObjectURL(file),
      progress: 0
    }));

    if (typeof this.onFiles === 'function') {
      this.onFiles(this.files);
    }
  }

  revokeAll() {
    this.files.forEach(f => URL.revokeObjectURL(f.url));
    this.files = [];
  }
}
