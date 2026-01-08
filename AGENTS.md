# AGENTS.md - Audiovis 1.0 Horizon Codebase

## Overview

This is an interactive 3D audio visualization application built by [Glissline](http://multidim.net). The project combines Three.js for 3D graphics, Web Audio API for audio playback, and Python-based audio analysis to create dynamic, music-driven visualizations.

**Live Demo:** [horizon.glissline.com](https://horizon.glissline.com)

## Current Technology Stack

### Frontend
- **Three.js** (v0.145.0) - 3D graphics rendering
- **dat.GUI** (v0.7.9) - GUI controls
- **Stats.js** (v0.17.0) - Performance monitoring
- **SortableJS** (v1.15.6) - Drag and drop functionality
- **Socket.IO** (client) - Real-time communication
- **Vanilla JavaScript (ES6)** - Application logic

### Backend
- **Node.js** with Express (v4.22.1) - Web server
- **Socket.IO** (v4.8.3) - WebSocket server
- **Python** - Audio analysis and processing

### Build Tools
- **Vite** (v7.x) - Modern build tool with HMR
- **Sass** (v1.97.x) - SCSS compilation (via Vite)

## Project Structure

```
Audiovis_1.0_Horizon/
├── public/
│   ├── content/              # Audio files and analysis JSON data
│   │   ├── Details/
│   │   ├── Horizon/
│   │   ├── SlowlyForget/
│   │   └── WaitingForTime/
│   ├── css/
│   │   └── scss/            # SCSS source files
│   │       └── main.scss
│   ├── js/
│   │   └── src/             # JavaScript source files
│   │       ├── main.js      # Entry point (imports dependencies)
│   │       ├── colors/      # Color-related modules
│   │       ├── models/      # 3D model classes
│   │       │   ├── helper.js
│   │       │   ├── spectrum.js
│   │       │   └── triangles.js
│   │       ├── scene.js     # Main scene controller
│   │       ├── scene_gui.js # Scene GUI controls
│   │       ├── song.js      # Song controller
│   │       ├── song_gui.js  # Song GUI controls
│   │       └── stem.js      # Audio stem controller
│   ├── img/                 # Images and assets
│   ├── tmp/                 # Temporary frame exports
│   └── index.html           # Main HTML entry point
├── dist/                    # Production build output (generated)
├── processor/               # Python audio processing scripts
│   ├── analysis.py          # Audio analysis utilities
│   ├── kmeans.py            # K-means clustering for audio
│   ├── main.py              # Main audio processor
│   ├── playlist.py          # Playlist generator
│   ├── processor.py         # Core processing logic
│   ├── song.py              # Song metadata
│   ├── vector_quantize.py   # Vector quantization
│   └── worker_*.py          # Parallel processing workers
├── index.js                 # Express server entry point (port 3001)
├── vite.config.js           # Vite configuration
├── package.json             # Node.js dependencies
└── README.md                # Project documentation
```

## Key Features & Architecture

### Audio Visualization System
- **Multi-track Support**: Handles multiple songs with individual audio stems
- **Real-time Analysis**: Processes audio frequency data for visualization
- **3D Scene Management**: Dynamic 3D objects synchronized with audio
- **Interactive Controls**: Mouse/touch navigation and playback controls

### Build Pipeline (Vite)
1. **Development**: `npm run dev` - Starts Vite dev server with HMR
2. **Production Build**: `npm run build` - Creates optimized bundle in `dist/`
3. **Preview**: `npm run preview` - Preview production build locally

The build process:
- Bundles all JavaScript modules starting from `public/js/src/main.js`
- Compiles SCSS to CSS
- Copies static assets (content/, img/, share.jpg) to dist/
- Generates source maps for debugging

### Audio Processing Workflow
1. Python scripts analyze WAV audio files
2. Generate JSON analysis data with frequency/spectral information
3. Convert WAV to MP3 for web playback
4. JavaScript loads and synchronizes analysis with playback

## Known Issues & Technical Debt

### Security & Deprecation Issues
- **Dependencies Updated**: Security vulnerabilities addressed in Phase 1
- **Three.js Updated**: Now using v0.145.0 (last UMD-compatible version)

### Code Quality
- **ES6 Modules**: All JavaScript files now use ES6 import/export
- **Limited Error Handling**: Minimal error boundaries and validation
- **Commented-out Code**: Dead code throughout (OSC, socket.io usage)
- **No TypeScript**: Lacks type safety and IDE support

### Build & Development
- **Vite Migration Complete**: Modern build system with HMR
- **Fast Builds**: Vite provides instant dev server and fast production builds
- **Tree Shaking**: Vite optimizes bundles automatically

### Testing & Quality Assurance
- **No Automated Tests**: Zero test coverage (unit, integration, or e2e)
- **No Linting Configuration**: ESLint not yet configured (Phase 3)
- **No Code Formatting**: No Prettier or consistent formatting rules
- **No CI/CD**: No automated builds or deployment

### Project Structure
- **Flat Directory Structure**: `public/js/src/` could benefit from better organization
- **Mixed Concerns**: Server logic minimal but could be better organized
- **Dual-Server Development**: Vite (port 3000) and Express (port 3001) run separately
- **No Environment Configuration**: Hardcoded values (ports, URLs)

## Quick Start for Contributors

```bash
# Install dependencies
npm install

# Start development server with HMR (port 3000)
npm run dev

# Start Express/Socket.IO server separately if needed (port 3001)
npm run dev:server

# Build for production
npm run build

# Preview production build (port 3000)
npm run preview

# Production: Build and start Express server (port 3001)
npm start
```

For information about future development workflow and modernization plans, see [REFACTOR.md](REFACTOR.md).

## Browser Support Target

### Current
- Modern ES6+ browsers (no IE11)
- WebGL 1.0/2.0 support via Three.js v0.145

## Notes for AI Agents

### When Working with This Codebase
1. **Use Vite dev server**: Run `npm run dev` for development with HMR on port 3000
2. **Express server separate**: Runs on port 3001 (use `npm run dev:server` if needed)
3. **Dependencies are modern**: Three.js v0.145 and updated packages
4. **No type safety**: Exercise caution with refactoring; easy to break things
5. **Audio analysis data**: JSON files in `public/content/` are generated by Python scripts
6. **Global dependencies**: Libraries are exposed via window object from main.js
7. **Server is simple**: Express server is minimal; most logic is client-side
8. **Production site**: Changes affect live site at horizon.glissline.com

### Common Tasks
- **Add new visualization**: Create class in `public/js/src/models/`, add to main.js
- **Modify scene**: Edit `public/js/src/scene.js`
- **Update styles**: Edit `public/css/scss/main.scss` (auto-reloads in dev)
- **Change audio behavior**: Edit `public/js/src/song.js` or `public/js/src/stem.js`
- **Server changes**: Edit `index.js`

### Testing Changes
```bash
# Start development server with HMR (port 3000)
npm run dev

# Open http://localhost:3000 in browser
# Changes auto-reload

# If you need Socket.IO features, run Express server separately (port 3001)
npm run dev:server

# For production build testing
npm run build
npm run preview  # Serves from dist/ on port 3000
```

For information about modernization priorities and future improvements, see [REFACTOR.md](REFACTOR.md).
