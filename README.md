# Nigerian Art Gallery - WebXR Experience

An immersive 3D virtual gallery showcasing Nigerian art and cultural heritage, built with React Three Fiber and WebXR technologies.

## 🎨 Features

- **3D Virtual Gallery**: Explore a beautifully designed square gallery room with realistic textures
- **Interactive Artwork**: Click on any of the 16 featured Nigerian artworks to learn more
- **Floating Information Panels**: 3D information displays that appear contextually near clicked artworks
- **Realistic Environment**: Stone tile walls, wood floors, marble columns, and decorative elements
- **Cultural Education**: Rich descriptions and historical stories for each artwork
- **Responsive Design**: Works on desktop and mobile devices
- **WebXR VR Support**: Full VR immersion with controller and hand tracking

## 🖼️ Art Collection

The gallery features 16 significant pieces of Nigerian art spanning centuries:

- Ancient Nok terracotta sculptures (500 BCE - 200 CE)
- Bronze masterpieces from Ife and Benin kingdoms
- Traditional masks and ceremonial objects
- Contemporary works by renowned artists like Ben Enwonwu

Each piece includes detailed historical context, cultural significance, and artistic analysis.

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers and abstractions
- **React Three XR** - WebXR integration for VR/AR
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (for overlays)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nigerian-art-gallery
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎮 How to Use

### Desktop/Mobile
1. **Navigate**: Use mouse to orbit around the gallery, scroll to zoom in/out
2. **Explore**: Walk through the square gallery room with artwork on all four walls
3. **Learn**: Click on any artwork to see detailed information in a floating 3D panel
4. **Close**: Click the red × button or anywhere on the panel to close information displays

### VR Mode
1. **Enter VR**: Click the "Enter VR" button (requires VR headset)
2. **Move**: Point controllers at the floor and trigger to teleport
3. **Interact**: Point at artwork and trigger to view information
4. **Explore**: Use hand tracking or controllers for natural interaction

## 📁 Project Structure

```
src/
├── components/
│   ├── Gallery.tsx          # Main gallery component
│   ├── Room.tsx             # 3D room with walls, floor, ceiling
│   ├── ArtPiece.tsx         # Individual artwork display
│   ├── FloatingInfoPanel.tsx # 3D information panels
│   └── ArtworkOverlay.tsx   # Alternative 2D overlay (unused)
├── data/
│   └── art.ts               # Artwork data and descriptions
├── assets/
│   ├── images/              # Artwork images
│   └── models/              # 3D models and textures
└── App.tsx                  # Root component
```

## 🎨 Assets

### 3D Models
- Decorative vase, plants, sculptures for ambiance
- Ceiling light fixture
- Various furniture pieces (some commented out)

### Textures
- **Floor**: Wood planks with displacement mapping
- **Walls**: Stone tile texture with normal mapping  
- **Ceiling**: Ornate interior ceiling pattern
- **Columns**: Marble mosaic tiles

### Artwork Images
High-quality images of 16 Nigerian artworks with proper attribution.

## 🔧 Customization

### Adding New Artwork
1. Add artwork data to `src/data/art.ts`
2. Place artwork image in `src/assets/images/`
3. The gallery automatically arranges 4 artworks per wall

### Modifying the Room
- Adjust `roomSize` in `Room.tsx` to change gallery dimensions
- Modify textures by updating texture paths
- Add/remove decorative elements in the Room component

### Styling Information Panels
- Customize panel appearance in `FloatingInfoPanel.tsx`
- Adjust text sizes, colors, and layout
- Modify panel positioning and rotation logic

## 🌐 Browser Support

- Chrome 88+ (recommended)
- Firefox 85+
- Safari 14+
- Edge 88+

WebXR features require compatible browsers and devices.

## 📱 Mobile Support

The gallery is optimized for mobile devices with touch controls for navigation and artwork interaction.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Nigerian cultural institutions for artwork documentation
- Three.js and React Three Fiber communities
- Texture and 3D model contributors
- Cultural historians and art experts who provided artwork descriptions

## 🔮 Future Enhancements

- Audio narration for artworks
- Virtual guided tours
- Multi-language support
- Social sharing features
- Additional gallery rooms
- Interactive timeline of Nigerian art history

---

**Experience Nigerian art and culture in an immersive 3D environment. Click, explore, and learn!**