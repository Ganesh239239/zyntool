// js/main.js

// Import specific tool logic
import compressTool from './tools/compress.js';
import cropTool from './tools/crop.js';
import resizeTool from './tools/resize.js';

// Registry maps URL hash to the tool file
const TOOL_REGISTRY = {
    'compress': compressTool,
    'crop': cropTool,
    'resize': resizeTool
    // Add others as you create files
};

const App = {
    currentTool: null,
    currentFile: null,

    init() {
        window.addEventListener('hashchange', () => this.router());
        window.addEventListener('load', () => this.router());
        
        // Global File Listeners
        document.getElementById('dropZone').onclick = () => document.getElementById('fileInput').click();
        document.getElementById('fileInput').onchange = (e) => this.handleFile(e.target.files[0]);
        document.getElementById('btnProcess').onclick = () => this.execute();
    },

    router() {
        const hash = window.location.hash.replace('#/', '');
        const home = document.getElementById('homeView');
        const workspace = document.getElementById('toolWorkspace');

        if (!hash || !TOOL_REGISTRY[hash]) {
            home.style.display = 'block';
            workspace.style.display = 'none';
        } else {
            home.style.display = 'none';
            workspace.style.display = 'block';
            this.loadTool(TOOL_REGISTRY[hash]);
        }
    },

    loadTool(toolModule) {
        this.currentTool = toolModule;
        this.resetUI();
        document.getElementById('toolTitle').textContent = toolModule.title;
        
        // Tool specific initialization if needed
        if (toolModule.onLoad) toolModule.onLoad();
    },

    handleFile(file) {
        if (!file) return;
        this.currentFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('imagePreview');
            img.src = e.target.result;
            
            img.onload = () => {
                document.getElementById('dropZone').style.display = 'none';
                document.getElementById('processingArea').style.display = 'block';
                
                // Load specific tool options UI
                const container = document.getElementById('optionsPanel');
                container.innerHTML = this.currentTool.renderUI(img.naturalWidth, img.naturalHeight);
                
                // Initialize specific tool logic (like Cropper)
                if (this.currentTool.init) this.currentTool.init(img);
            };
        };
        reader.readAsDataURL(file);
    },

    async execute() {
        const btn = document.getElementById('btnProcess');
        btn.innerText = 'Processing...';
        btn.disabled = true;

        try {
            const img = document.getElementById('imagePreview');
            // Execute the specific tool's logic
            const blob = await this.currentTool.process(img, this.currentFile);
            
            // Download Logic
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `iloveimg-edited.png`;
            a.click();
        } catch (e) {
            console.error(e);
            alert('Error processing image');
        } finally {
            btn.innerText = 'Process';
            btn.disabled = false;
        }
    },

    resetUI() {
        document.getElementById('dropZone').style.display = 'block';
        document.getElementById('processingArea').style.display = 'none';
        document.getElementById('fileInput').value = '';
        if (this.currentTool.cleanup) this.currentTool.cleanup();
    }
};

App.init();
