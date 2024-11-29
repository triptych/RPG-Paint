# RPG Paint

A web-based tile painting tool that lets you create 2D game maps or pixel art using RPG tiles. Built with vanilla JavaScript, HTML5 Canvas, and CSS, RPG Paint provides an intuitive interface for creating tile-based artwork.

## Features

- **Tile Selection**: Browse and select from a comprehensive tileset (ProjectUtumno_full.png)
- **Grid-Based Canvas**: Paint tiles on a 32x32 pixel grid
- **Real-Time Preview**: See your selected tile in a preview window
- **Download Functionality**: Export your creation as a PNG file
- **Responsive Design**: Clean, modern interface with smooth interactions
- **Progress Indicator**: Visual feedback while loading assets

## Usage

1. **Select a Tile**:
   - Browse the tile palette on the right
   - Click any tile to select it
   - The selected tile appears in the "Selected Tile" preview

2. **Paint on Canvas**:
   - Click anywhere on the main canvas to place the selected tile
   - The canvas uses a 32x32 pixel grid for precise placement

3. **Export Your Work**:
   - Click the "Download Canvas" button to save your creation as a PNG file

## Technical Details

- Uses HTML5 Canvas for rendering
- Implements custom grid system for precise tile placement
- Features smooth scrolling tile palette with custom scrollbar styling
- Responsive design with CSS variables for consistent theming
- Progress tracking for asset loading

## Development

The project consists of three main files:

- `index.html`: Core structure and layout
- `style.css`: Styling with CSS variables for theming
- `script.js`: Canvas manipulation and interaction logic

## Credits

This project uses the ProjectUtumno tileset for the tile palette.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
