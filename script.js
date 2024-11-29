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
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw all tiles from stored positions (if we had them)
  // For now just redraw the grid
  drawGrid(ctx, canvas.width, canvas.height, 32);
}

const genViewPort = () => {
  let vp = document.querySelector('#canvas1');
  let ctx = vp.getContext("2d", { alpha: true });
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

    // Temporarily hide grid if it's shown
    const gridWasShown = showGrid;
    if (gridWasShown) {
      showGrid = false;
      redrawCanvas(vp);
    }

    // Create a temporary link element
    const tempLink = document.createElement('a');
    tempLink.download = 'rpg-paint-creation.png';
    tempLink.href = vp.toDataURL('image/png', 1.0);
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Restore grid if it was shown
    if (gridWasShown) {
      showGrid = true;
      redrawCanvas(vp);
    }
  });

  vp.addEventListener("click", (e) => {
    applyTileToView(e);
  });

  return vp;
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

  const ctx = canvas.getContext('2d');
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

  // Redraw grid lines if grid is visible
  if (showGrid) {
    drawGrid(ctx, canvas.width, canvas.height, gridSize);
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
  document.querySelector('.viewport').appendChild(genViewPort());
});
