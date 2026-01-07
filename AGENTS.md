# AGENTS.md - Audiovis 1.0 Horizon Codebase

## Overview

This is an interactive 3D audio visualization application built by [Glissline](http://multidim.net). The project combines Three.js for 3D graphics, Web Audio API for audio playback, and Python-based audio analysis to create dynamic, music-driven visualizations.

**Live Demo:** [horizon.glissline.com](https://horizon.glissline.com)

## Current Technology Stack

### Frontend
- **Three.js** (v0.89.0) - 3D graphics rendering
- **dat.GUI** (v0.7.9) - GUI controls
- **Stats.js** (v0.17.0) - Performance monitoring
- **SortableJS** (v1.7.0) - Drag and drop functionality
- **Socket.IO** (client) - Real-time communication
- **Vanilla JavaScript (ES6)** - Application logic

### Backend
- **Node.js** with Express (v4.22.1) - Web server
- **Socket.IO** (v4.8.3) - WebSocket server
- **Python** - Audio analysis and processing

### Build Tools
- **Grunt** (v1.0.3) - Task runner
- **grunt-contrib-jshint** - JavaScript linting
- **grunt-contrib-uglify** - JavaScript minification
- **grunt-sass** - SCSS compilation
- **grunt-babel** - JavaScript transpilation (ES6 to ES5)
- **grunt-contrib-watch** - File watching

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
│   │   ├── scss/            # SCSS source files
│   │   │   └── main.scss
│   │   └── styles.min.css   # Compiled CSS (generated)
│   ├── js/
│   │   ├── src/             # JavaScript source files
│   │   │   ├── colors/      # Color-related modules
│   │   │   ├── models/      # 3D model classes
│   │   │   │   ├── helper.js
│   │   │   │   ├── spectrum.js
│   │   │   │   └── triangles.js
│   │   │   ├── scene.js     # Main scene controller
│   │   │   ├── scene_gui.js # Scene GUI controls
│   │   │   ├── song.js      # Song controller
│   │   │   ├── song_gui.js  # Song GUI controls
│   │   │   └── stem.js      # Audio stem controller
│   │   ├── dist/            # Babel-compiled files (generated)
│   │   ├── app.min.js       # Minified app bundle (generated)
│   │   ├── app.min.map      # Source map (generated)
│   │   ├── dep.min.js       # Minified dependencies (generated)
│   │   └── dep.min.map      # Source map (generated)
│   ├── img/                 # Images and assets
│   ├── tmp/                 # Temporary frame exports
│   └── index.html           # Main HTML entry point
├── processor/               # Python audio processing scripts
│   ├── analysis.py          # Audio analysis utilities
│   ├── kmeans.py            # K-means clustering for audio
│   ├── main.py              # Main audio processor
│   ├── playlist.py          # Playlist generator
│   ├── processor.py         # Core processing logic
│   ├── song.py              # Song metadata
│   ├── vector_quantize.py   # Vector quantization
│   └── worker_*.py          # Parallel processing workers
├── index.js                 # Express server entry point
├── Gruntfile.js            # Grunt configuration
├── package.json            # Node.js dependencies
└── README.md               # Project documentation
```

## Key Features & Architecture

### Audio Visualization System
- **Multi-track Support**: Handles multiple songs with individual audio stems
- **Real-time Analysis**: Processes audio frequency data for visualization
- **3D Scene Management**: Dynamic 3D objects synchronized with audio
- **Interactive Controls**: Mouse/touch navigation and playback controls

### Build Pipeline
1. **SCSS Compilation**: `public/css/scss/main.scss` → `public/css/styles.min.css`
2. **JavaScript Linting**: JSHint validates code quality
3. **JavaScript Transpilation**: Babel converts ES6+ to ES5
4. **JavaScript Bundling**: Uglify minifies and bundles:
   - App code: `public/js/src/**/*.js` → `public/js/app.min.js`
   - Dependencies: Third-party libs → `public/js/dep.min.js`

### Audio Processing Workflow
1. Python scripts analyze WAV audio files
2. Generate JSON analysis data with frequency/spectral information
3. Convert WAV to MP3 for web playback
4. JavaScript loads and synchronizes analysis with playback

## Known Issues & Technical Debt

### Security & Deprecation Issues
- **Old Node.js Dependencies**: Several packages have security vulnerabilities (4 vulnerabilities remain)
- **Outdated Three.js**: v0.89.0 (2017) - many versions behind current

### Code Quality
- **ES6 Classes Mixed with ES5 Patterns**: Inconsistent JavaScript patterns
- **No Module System**: Using global scripts instead of ES modules
- **Limited Error Handling**: Minimal error boundaries and validation
- **Commented-out Code**: Dead code throughout (OSC, socket.io usage)
- **No TypeScript**: Lacks type safety and IDE support

### Build & Development
- **Grunt is Legacy**: Industry has moved to Vite, Webpack, or esbuild
- **No Hot Module Replacement**: Requires manual refresh during development
- **Slow Build Times**: Multiple transpilation/minification steps
- **No Tree Shaking**: Bundles include unused code
- **Separate Babel Step**: Unnecessary intermediate compilation

### Testing & Quality Assurance
- **No Automated Tests**: Zero test coverage (unit, integration, or e2e)
- **No Linting Configuration**: JSHint is outdated (prefer ESLint)
- **No Code Formatting**: No Prettier or consistent formatting rules
- **No CI/CD**: No automated builds or deployment

### Project Structure
- **Flat Directory Structure**: `public/js/src/` could benefit from better organization
- **Mixed Concerns**: Server logic minimal but could be better organized
- **No Environment Configuration**: Hardcoded values (ports, URLs)
- **Python .pyc Files in Repo**: Compiled Python files should be gitignored

## Quick Start for Contributors

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the development server
npm start

# Watch for changes (in separate terminal)
npx grunt watch
```

For information about future development workflow and modernization plans, see [REFACTOR.md](REFACTOR.md).

## Browser Support Target

### Current
- Legacy ES5 support via Babel
- WebGL 1.0 support via Three.js v0.89

## Notes for AI Agents

### When Working with This Codebase
1. **Build before changes**: Always run `npm run build` before making code changes to understand existing issues
2. **Dependencies are old**: Be aware of deprecated APIs and patterns
3. **No type safety**: Exercise caution with refactoring; easy to break things
4. **Audio analysis data**: JSON files in `public/content/` are generated by Python scripts
5. **Global dependencies**: Three.js and other libraries are loaded globally in HTML
6. **Server is simple**: Express server is minimal; most logic is client-side
7. **Production site**: Changes affect live site at horizon.glissline.com

### Common Tasks
- **Add new visualization**: Create class in `public/js/src/models/`
- **Modify scene**: Edit `public/js/src/scene.js`
- **Update styles**: Edit `public/css/scss/main.scss` and rebuild
- **Change audio behavior**: Edit `public/js/src/song.js` or `public/js/src/stem.js`
- **Server changes**: Edit `index.js`

### Testing Changes
```bash
# Build the project
npm run build

# Start server
npm start

# Open http://localhost:3000 in browser
# Check browser console for errors
```

For information about modernization priorities and future improvements, see [REFACTOR.md](REFACTOR.md).
