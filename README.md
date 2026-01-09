# Audiovis

> **⚠️ WARNING: Legacy Code**  
> This is old legacy code that needs to be refactored. The codebase may not follow modern best practices and could benefit from significant improvements to structure, dependencies, and implementation patterns.

An interactive 3D audio visualization experience by [Glissline](http://multidim.net), featuring immersive visual representations synchronized with music.

🔗 **Live Demo:** [horizon.glissline.com](https://horizon.glissline.com)

## Overview

Horizon is an interactive audio-visual experience that combines Three.js 3D graphics with real-time audio analysis to create dynamic, music-driven visualizations. Users can navigate through different songs and explore 3D objects that respond to the audio in real-time.

## Features

- **Interactive 3D Visualization**: Explore music through dynamic 3D graphics using Three.js
- **Multiple Songs**: Navigate between various tracks including:
  - Details
  - Horizon
  - Slowly Forget
  - Waiting For Time
- **Real-time Audio Analysis**: Python-based audio processing and spectral analysis
- **Responsive Controls**: Mouse/touch navigation and song controls
- **Socket.IO Integration**: Real-time frame rendering capabilities

## Prerequisites

- Node.js (v20 or higher)
- Python (for audio processing)
- LAME encoder (for MP3 conversion)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tommymetz/Audiovis_1.0_Horizon.git
cd Audiovis_1.0_Horizon
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Convert audio files to MP3 (if needed):
```bash
cd public/content
lame --abr 90 Details/Details.wav Details/Details.mp3
lame --abr 90 Details2/Details2.wav Details2/Details2.mp3
lame --abr 90 Horizon/Horizon.wav Horizon/Horizon.mp3
lame --abr 90 SlowlyForget/SlowlyForget.wav SlowlyForget/SlowlyForget.mp3
lame --abr 90 SlowlyForget2/SlowlyForget2.wav SlowlyForget2/SlowlyForget2.mp3
lame --abr 90 WaitingForTime/WaitingForTime.wav WaitingForTime/WaitingForTime.mp3
lame --abr 90 WaitingForTime2/WaitingForTime2.wav WaitingForTime2/WaitingForTime2.mp3
cd ../..
```

## Development

**For Development** (with Hot Module Replacement):
```bash
npm run dev
```
This starts the Vite dev server on http://localhost:3000 with instant reloading.

**Build for Production:**
```bash
npm run build
```

This will:
- Bundle and minify JavaScript modules using Vite
- Compile SCSS to CSS
- Copy static assets (content, images) to `dist/`
- Generate source maps for debugging

## Running the Application

**For Development:**
```bash
npm run dev
```
Open your browser to http://localhost:3000 (Vite dev server with HMR)

**For Production:**
```bash
npm start
```
This builds the project and starts the Express server on http://localhost:3001

**Socket.IO Server Only** (if needed for frame rendering):
```bash
npm run dev:server
```
Runs the Express server on port 3001

### Dev Mode

Enable developer mode (shows stats and control panels) by adding `?devmode=true` to the URL:
- `http://localhost:3001/?devmode=true` (when using `npm start`)

**Note:** Dev mode only works when running the application via `npm start` (the Express/production server). It is not available when using `npm run dev` (Vite dev server).

## Audio Processing

The project includes Python-based audio analysis tools:

```bash
# Generate playlist
npm run playlist

# Run audio analysis
npm run analysis
```

These scripts are located in the `processor/` directory and handle spectral analysis and audio feature extraction.

## Project Structure

```
Audiovis_1.0_Horizon/
├── public/                 # Source files and assets
│   ├── content/           # Audio files and JSON analysis data
│   ├── css/scss/          # SCSS source files
│   ├── js/src/            # JavaScript ES6 modules
│   ├── img/               # Images and assets
│   └── index.html         # Main HTML file
├── dist/                  # Production build output (generated)
├── processor/             # Python audio processing scripts
├── index.js               # Express server (port 3001)
├── vite.config.js         # Vite build configuration
└── package.json           # Node.js dependencies and scripts
```

## Technologies Used

- **Frontend**: Three.js (v0.145.0), Socket.IO, dat.GUI, Stats.js, SortableJS
- **Backend**: Node.js, Express
- **Build Tools**: Vite (v7.x), Sass
- **Audio Processing**: Python, LAME encoder

## Development Workflow

The project uses Vite for modern development:
- **Hot Module Replacement (HMR)**: Instant updates without full page reload
- **SCSS compilation**: Automatic preprocessing with source maps
- **ES Module bundling**: Optimized production bundles
- **Fast dev server**: Lightning-fast startup and rebuild times

## Credits

Created by Glissline - [multidim.net](http://multidim.net)

## License

Copyright © 2018 Glissline
