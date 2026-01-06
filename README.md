# Audiovis 1.0 - Horizon

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
- **Socket.io Integration**: Real-time frame rendering capabilities

## Prerequisites

- Node.js (v8 or higher recommended)
- Python (for audio processing)
- LAME encoder (for MP3 conversion)
- Grunt CLI: `npm install -g grunt-cli`

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

## Building

Build the application using Grunt:

```bash
# Build all assets (JS, CSS)
npm run build

# Build dependencies only
npm run build-dep
```

This will:
- Compile and minify JavaScript files
- Process SCSS to CSS
- Run linting checks

## Running the Application

1. Start the Express server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

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
├── public/                 # Client-side assets
│   ├── content/           # Audio files and content
│   ├── css/               # Stylesheets (SCSS/CSS)
│   ├── js/                # JavaScript source and compiled files
│   ├── img/               # Images and assets
│   └── index.html         # Main HTML file
├── processor/             # Python audio processing scripts
├── index.js               # Express server
├── Gruntfile.js          # Grunt build configuration
└── package.json          # Node.js dependencies and scripts
```

## Technologies Used

- **Frontend**: Three.js, Socket.io, dat.GUI, Stats.js, SortableJS
- **Backend**: Node.js, Express
- **Build Tools**: Grunt, Babel
- **Audio Processing**: Python, LAME encoder

## Development

The project uses Grunt for asset compilation and includes:
- JavaScript linting with JSHint
- SCSS compilation
- JavaScript minification and source maps
- Watch tasks for development

## Credits

Created by Glissline - [multidim.net](http://multidim.net)

## License

Copyright © 2018 Glissline
