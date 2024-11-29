var img = new Image();
img.setAttribute('crossOrigin', 'anonymous');
img.onload = function(e) {
  console.log(e.target)
  genPallette(document.querySelector('#inner'));
}
img.src = 'ProjectUtumno_full.png';

let selectedTilePos = { row: 0, col: 0 }; // Track the selected tile position

const drawGrid = (ctx, width, height, gridSize) => {
  ctx.strokeStyle = '#f2f2f2';
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

const genViewPort = () => {
  let vp = document.querySelector('#canvas1');
  let ctx = vp.getContext("2d");
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, vp.width, vp.height);

  drawGrid(ctx, vp.width, vp.height, 32);

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

  // Redraw grid lines for this cell
  drawGrid(ctx, canvas.width, canvas.height, gridSize);
}

const genPallette = (el) => {
  let rows = 95;
  let cols = 64;
  const baseWidth = 32;
  const baseHeight = 32;

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
      el.appendChild(can)
      let ctx = can.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, baseWidth * j, baseHeight * i, baseWidth, baseHeight, 0, 0, 64, 64)
      can.addEventListener("click", () => {
        selectedTile(can.dataset.row, can.dataset.col, can)
      });
    }
  }
}

const selectedTile = (row, col, can) => {
  // Update selected tile position
  selectedTilePos.row = parseInt(row);
  selectedTilePos.col = parseInt(col);

  const ccanvas = document.querySelector("#chosencanvas");
  let ctx = ccanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, ccanvas.width, ccanvas.height);
  ctx.drawImage(can, 0, 0, 64, 64, 0, 0, 64, 64)
}

window.addEventListener('load', () => {
  document.querySelector('.viewport').appendChild(genViewPort());
});
