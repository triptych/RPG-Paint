var img = new Image();
img.setAttribute('crossOrigin', 'anonymous');
img.onload = function(e) {
  console.log(e.target)
  genPallette(document.querySelector('#inner'));
}
img.src = 'ProjectUtumno_full.png';

const genViewPort = () => {
  let vp = document.querySelector('#canvas1');

  let ctx = vp.getContext("2d");
  let gridOptions = {
    color: '#f2f2f2',
    GridSize: 32,
    LinesSize: 1
  };
  let Height = vp.height;
  let Width = vp.width;
  ctx.strokeStyle = gridOptions.color;
  ctx.lineWidth = parseInt(gridOptions.LinesSize);
  let GridSize = 0;
  GridSize = parseInt(gridOptions.GridSize);
  for (let i = 0; i < Height; i += GridSize) {
    ctx.moveTo(0, i);
    ctx.lineTo(Width, i);
    ctx.stroke();
  }
  for (let i = 0; i < Width; i += GridSize) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, Height);
    ctx.stroke();
  }
  vp.addEventListener("click", (e) => {
    applyTileToView(e);
  })
  return vp;
}

const genPallette = (el) => {
  let rows = 95;
  let cols = 64;
  const baseWidth = 32;
  const baseHeight = 32;
  // const img = document.querySelector(".imagepool img");
  // console.log(img);
  // console.log(img.loaded)


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
      // console.log(can)

    }
  }
}

const selectedTile = (row, col, can) => {
  const ccanvas = document.querySelector("#chosencanvas");
  let ctx = ccanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, ccanvas.width, ccanvas.height);

  ctx.drawImage(can, 0, 0, 64, 64, 0, 0, 64, 64)

}

window.addEventListener('load', () => {
  document.querySelector('.viewport').appendChild(genViewPort());
  //genPallette(document.querySelector('#inner'));
})