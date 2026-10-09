# Nigerian Art Gallery - WebXR Experience

An immersive 3D virtual gallery showcasing Nigerian art and cultural heritage, built with React Three Fiber and WebXR.

## 🎨 Features

- **3D Virtual Gallery**: Explore a square gallery room with textured walls, floor, and ceiling
- **Interactive Artwork**: Click (or VR-select) any of the 16 featured artworks to learn more
- **Floating Information Panels**: 3D information panels appear near the selected artwork
- **Desktop Navigation**: Switch between orbit mode and WASD first-person mode without reloading
- **WebXR / VR**: Enter immersive VR on supported headsets and select artworks with controllers
- **Responsive Design**: Works on desktop and mobile devices

## 🖼️ Art Collection

The gallery features 16 significant pieces of Nigerian art spanning centuries:

- Ancient Nok terracotta sculptures (500 BCE - 200 CE)
- Bronze masterpieces from Ife and Benin kingdoms
- Traditional masks and ceremonial objects
- Contemporary works by renowned artists like Ben Enwonwu

Each piece includes historical context, cultural significance, and artistic analysis.

## 🛠️ Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Helpers and abstractions
- **Zustand** - Application state (selected artwork, navigation mode, WebXR manager)
- **Vite** - Build tool and dev server

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and [Bun](https://bun.sh) (or npm)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nigerian-art-gallery
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

4. Open your browser at `http://localhost:5173`

## 🎮 How to Use

1. **Navigate**: Orbit mode uses the mouse; WASD mode uses `W/A/S/D` to move and `Q/E` to turn
2. **Switch modes**: Use the Orbit/WASD buttons in the top-left corner (desktop only)
3. **Learn**: Click any artwork to see details in a floating 3D panel; click the red × or the panel to close
4. **VR**: On a WebXR-capable device, use the "Enter VR" button; point with the controller laser and pull the trigger to select artwork

## 📁 Project Structure

```
src/
├── components/
│   ├── Gallery.tsx            # Root gallery: canvas, lighting, controls, WebXR setup
│   ├── Room.tsx               # 3D room, textures, artwork layout
│   ├── ArtPiece.tsx           # Individual artwork display and interaction
│   ├── FloatingInfoPanel.tsx  # 3D information panel for the selected artwork
│   ├── LazyDecorations.tsx    # Lazily loaded decorative models
│   ├── NavigationSelector.tsx # Desktop navigation mode switcher
│   ├── FirstPersonControls.tsx # WASD + Q/E first-person controls
│   └── LoadingScreen.tsx      # Loading progress overlay
├── hooks/
│   ├── useOptimizedTexture.ts # Texture loading with tiling
│   └── useIntersectable.ts    # Registers meshes for VR controller selection
├── webxr/
│   ├── WebXRManager.ts        # VR session, controllers, laser raycasting
│   └── VRButton.ts            # Enter/exit VR button
├── data/
│   └── art.ts                 # Artwork data and descriptions
├── store.ts                   # Zustand store shared by all components
└── App.tsx                    # Root component
```

## 🎨 Assets

### 3D Models
- Decorative vase, plant, and sculpture for ambiance
- Ceiling light fixture

### Textures
- **Floor**: Wood planks (2K diffuse)
- **Walls**: Stone tile (1K diffuse)
- **Ceiling**: Ornate interior pattern (1K diffuse)
- **Columns**: Marble mosaic tiles (1K diffuse)

### Artwork Images
High-quality images of 16 Nigerian artworks with proper attribution, in `public/images/`.

## 🔧 Customization

### Adding New Artwork
1. Add artwork data to `src/data/art.ts`
2. Place the artwork image in `public/images/`
3. The gallery automatically arranges 4 artworks per wall

### Modifying the Room
- Adjust `roomSize` in `Room.tsx` to change gallery dimensions
- Modify texture paths in `Room.tsx`
- Add/remove decorative elements in `LazyDecorations.tsx`

## 🌐 Browser Support

- Chrome 88+ (recommended)
- Firefox 85+
- Safari 14+
- Edge 88+

WebXR features require compatible browsers and devices.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Nigerian cultural institutions for artwork documentation
- Three and React Three Fiber communities
- Texture and 3D model contributors
- Cultural historians and art experts who provided artwork descriptions

## 🔮 Future Enhancements

- Audio narration for artworks
- Virtual guided tours
- Multi-user / social features
- Multi-language support
- Additional gallery rooms

---

**Experience Nigerian art and culture in an immersive 3D environment. Click, explore, and learn!**
