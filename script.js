class Layer {
  constructor(id) {
    this.id = id;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 320;
    this.canvas.height = 320;
    this.ctx = this.canvas.getContext('2d');
    this.visible = true;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class LayerManager {
  constructor() {
    this.layers = [];
    this.activeLayerId = 0;
    this.nextLayerId = 1;
    this.draggedLayer = null;

    // Create initial layer
    this.addLayer();

    // Setup event listeners
    this.setupEventListeners();
  }

  addLayer() {
    const layer = new Layer(this.nextLayerId++);
    this.layers.push(layer);
    this.activeLayerId = layer.id;
    this.updateLayersList();
    return layer;
  }

  deleteLayer(id) {
    if (this.layers.length <= 1) return; // Don't delete the last layer

    const index = this.layers.findIndex(l => l.id === id);
    if (index !== -1) {
      this.layers.splice(index, 1);
      if (this.activeLayerId === id) {
        this.activeLayerId = this.layers[0].id;
      }
      this.updateLayersList();
      this.redrawMainCanvas();
    }
  }

  toggleLayerVisibility(id) {
    const layer = this.layers.find(l => l.id === id);
    if (layer) {
      layer.visible = !layer.visible;
      this.redrawMainCanvas();
    }
  }

  getActiveLayer() {
    return this.layers.find(l => l.id === this.activeLayerId);
  }

  setupEventListeners() {
    document.getElementById('addLayer').addEventListener('click', () => this.addLayer());

    document.getElementById('layersList').addEventListener('click', (e) => {
      const layerItem = e.target.closest('.layer-item');
      if (!layerItem) return;

      if (e.target.classList.contains('layer-delete')) {
        this.deleteLayer(parseInt(layerItem.dataset.layer));
      } else if (e.target.classList.contains('layer-visibility')) {
        this.toggleLayerVisibility(parseInt(layerItem.dataset.layer));
      } else {
        // Set active layer when clicking on layer item
        this.activeLayerId = parseInt(layerItem.dataset.layer);
        this.updateLayersList();
      }
    });

    // Setup drag and drop event listeners on the layers list container
    const layersList = document.getElementById('layersList');
    layersList.addEventListener('dragstart', (e) => {
      const layerItem = e.target.closest('.layer-item');
      if (!layerItem) return;

      this.draggedLayer = parseInt(layerItem.dataset.layer);
      e.target.style.opacity = '0.5';

      // Required for Firefox
      e.dataTransfer.setData('text/plain', '');
    });

    layersList.addEventListener('dragend', (e) => {
      e.target.style.opacity = '1';
      this.draggedLayer = null;
    });

    layersList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const layerItem = e.target.closest('.layer-item');
      if (!layerItem) return;

      const rect = layerItem.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;

      // Remove existing drop indicators
      layersList.querySelectorAll('.drop-indicator').forEach(el => el.remove());

      // Create and position drop indicator
      const indicator = document.createElement('div');
      indicator.className = 'drop-indicator';

      if (e.clientY < midpoint) {
        layerItem.parentNode.insertBefore(indicator, layerItem);
      } else {
        layerItem.parentNode.insertBefore(indicator, layerItem.nextSibling);
      }
    });

    layersList.addEventListener('dragleave', () => {
      // Remove drop indicators when dragging outside
      layersList.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    });

    layersList.addEventListener('drop', (e) => {
      e.preventDefault();
      const layerItem = e.target.closest('.layer-item');
      if (!layerItem || this.draggedLayer === null) return;

      const targetId = parseInt(layerItem.dataset.layer);
      const sourceIndex = this.layers.findIndex(l => l.id === this.draggedLayer);
      const targetIndex = this.layers.findIndex(l => l.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return;

      // Get drop position relative to target element
      const rect = layerItem.getBoundingClientRect();
      const dropPosition = e.clientY < (rect.top + rect.height / 2) ? 'before' : 'after';

      // Remove the layer from its current position
      const [movedLayer] = this.layers.splice(sourceIndex, 1);

      // Calculate new target index based on drop position
      const newTargetIndex = dropPosition === 'before' ?
        targetIndex > sourceIndex ? targetIndex - 1 : targetIndex :
        targetIndex > sourceIndex ? targetIndex : targetIndex + 1;

      // Insert the layer at the new position
      this.layers.splice(newTargetIndex, 0, movedLayer);

      // Remove drop indicators
      layersList.querySelectorAll('.drop-indicator').forEach(el => el.remove());

      // Update UI
      this.updateLayersList();
      this.redrawMainCanvas();
    });
  }

  updateLayersList() {
    const layersList = document.getElementById('layersList');
    layersList.innerHTML = this.layers.map(layer => `
      <div class="layer-item ${layer.id === this.activeLayerId ? 'active' : ''}"
           data-layer="${layer.id}"
           draggable="true">
        <input type="checkbox" class="layer-visibility" ${layer.visible ? 'checked' : ''}>
        <span class="layer-name">Layer ${layer.id}</span>
        <button class="layer-delete" title="Delete layer">×</button>
      </div>
    `).join('');
  }

  redrawMainCanvas() {
    const mainCanvas = document.getElementById('canvas1');
    const ctx = mainCanvas.getContext('2d');
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    // Draw all visible layers from bottom to top
    this.layers.forEach(layer => {
      if (layer.visible) {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    });

    // Redraw grid if enabled
    if (showGrid) {
      drawGrid(ctx, mainCanvas.width, mainCanvas.height, 32);
    }
  }

  // Get composite of all visible layers for download
  getCompositeCanvas() {
    const composite = document.createElement('canvas');
    composite.width = 320;
    composite.height = 320;
    const ctx = composite.getContext('2d');

    this.layers.forEach(layer => {
      if (layer.visible) {
        ctx.drawImage(layer.canvas, 0, 0);
      }
    });

    return composite;
  }
}

var img = new Image();
img.onerror = function(e) {
  console.error('Error loading image:', e);
};

// Show progress popup when starting to load
const progressPopup = document.getElementById('progress-popup');
const progressFill = document.querySelector('.progress-fill');
progressPopup.style.display = 'block';
progressFill.style.width = '30%'; // Initial progress - image loading

img.onload = function(e) {
  console.log('Image loaded successfully');
  progressFill.style.width = '60%'; // Update progress - image loaded
  setTimeout(() => {
    genPallette(document.querySelector('#inner'));
  }, 0);
}
img.src = 'ProjectUtumno_full.png';

let selectedTilePos = { row: 0, col: 0 }; // Track the selected tile position
let lastSelectedCell = null; // Track the last selected cell for highlighting
let showGrid = true; // Track grid visibility state
let layerManager; // Layer manager instance

const drawGrid = (ctx, width, height, gridSize) => {
  if (!showGrid) return; // Skip grid drawing if grid is toggled off

  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let i = 0; i <= width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let i = 0; i <= height; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }
}

const redrawCanvas = (canvas) => {
  layerManager.redrawMainCanvas();
}

const genViewPort = () => {
  let vp = document.querySelector('#canvas1');
  let ctx = vp.getContext("2d", { alpha: true });

  // Initialize layer manager
  layerManager = new LayerManager();

  drawGrid(ctx, vp.width, vp.height, 32);

  // Setup grid toggle functionality
  const gridToggle = document.querySelector('#gridToggle');
  gridToggle.addEventListener('change', (e) => {
    showGrid = e.target.checked;
    redrawCanvas(vp);
  });

  // Setup download functionality
  const downloadLink = document.querySelector('#downloadable');
  downloadLink.addEventListener('click', function(e) {
    e.preventDefault();

    // Get composite of visible layers without grid
    const composite = layerManager.getCompositeCanvas();

    // Create a temporary link element
    const tempLink = document.createElement('a');
    tempLink.download = 'rpg-paint-creation.png';
    tempLink.href = composite.toDataURL('image/png', 1.0);
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  });

  vp.addEventListener("click", (e) => {
    applyTileToView(e);
  });
}

const applyTileToView = (e) => {
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const gridSize = 32;

  // Calculate grid position
  const gridX = Math.floor(x / gridSize) * gridSize;
  const gridY = Math.floor(y / gridSize) * gridSize;

  // Get active layer and draw on it
  const activeLayer = layerManager.getActiveLayer();
  if (activeLayer) {
    const ctx = activeLayer.ctx;
    ctx.imageSmoothingEnabled = false;

    // Clear the specific grid cell
    ctx.clearRect(gridX, gridY, gridSize, gridSize);

    // Draw the selected tile at the grid position
    ctx.drawImage(
      img,
      selectedTilePos.col * 32,  // source x
      selectedTilePos.row * 32,  // source y
      32, 32,                    // source width/height
      gridX, gridY,             // destination x/y
      32, 32                    // destination width/height
    );

    // Update main canvas
    layerManager.redrawMainCanvas();
  }
}

const genPallette = (el) => {
  let rows = 95;
  let cols = 64;
  const baseWidth = 32;
  const baseHeight = 32;
  let tilesGenerated = 0;
  const totalTiles = rows * cols;

  // Clear existing content
  el.innerHTML = '';

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let can = document.createElement("canvas");
      Object.assign(can, {
        className: 'cell',
        height: 64,
        width: 64
      });
      can.dataset.row = i;
      can.dataset.col = j;
      el.appendChild(can);
      let ctx = can.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, baseWidth * j, baseHeight * i, baseWidth, baseHeight, 0, 0, 64, 64);

      tilesGenerated++;
      // Update progress (60-95% range for tile generation)
      const progress = 60 + (tilesGenerated / totalTiles) * 35;
      progressFill.style.width = progress + '%';

      can.addEventListener("click", () => {
        if (lastSelectedCell) {
          lastSelectedCell.style.borderColor = 'transparent';
        }
        can.style.borderColor = '#3498db';
        lastSelectedCell = can;
        selectedTile(can.dataset.row, can.dataset.col, can);
      });
    }
  }

  // Complete the progress and hide the popup
  progressFill.style.width = '100%';
  setTimeout(() => {
    progressPopup.style.display = 'none';
  }, 500);
}

const selectedTile = (row, col, can) => {
  // Update selected tile position
  selectedTilePos.row = parseInt(row);
  selectedTilePos.col = parseInt(col);

  const ccanvas = document.querySelector("#chosencanvas");
  let ctx = ccanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, ccanvas.width, ccanvas.height);
  ctx.drawImage(can, 0, 0, 64, 64, 0, 0, 64, 64);
}

window.addEventListener('load', () => {
  genViewPort();
});
