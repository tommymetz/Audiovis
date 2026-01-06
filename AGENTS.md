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
- **Node.js** with Express (v4.16.4) - Web server
- **Socket.IO** (v2.1.1) - WebSocket server
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
- **Deprecated Buffer Constructor**: `index.js` uses deprecated `new Buffer()` constructor
- **Old Node.js Dependencies**: Several packages have security vulnerabilities
- **Outdated Three.js**: v0.89.0 (2017) - many versions behind current
- **Socket.IO v2**: Multiple security advisories, should upgrade to v4+

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

## Modernization Roadmap

### Phase 1: Essential Security & Maintenance
- [ ] **Update Node.js dependencies** to address security vulnerabilities
  - [ ] Upgrade Socket.IO from v2.1.1 to v4.x
  - [ ] Update Express to v4.x latest
  - [ ] Replace deprecated `new Buffer()` with `Buffer.from()` in `index.js`
  - [ ] Update all other dependencies to latest stable versions
- [ ] **Update Three.js** from v0.89.0 to latest (v0.160+)
  - [ ] Update Three.js imports and API usage
  - [ ] Replace deprecated OrbitControls import
  - [ ] Update Detector.js usage (now built-in)
- [ ] **Improve .gitignore**
  - [ ] Add Python .pyc files and __pycache__ directories
  - [ ] Add build output directories (dist, public/js/dist)
  - [ ] Add IDE-specific files (.vscode, .idea)
  - [ ] Add OS-specific files (.DS_Store handled, add Thumbs.db)

### Phase 2: Modern Build System Migration
- [ ] **Migrate from Grunt to Vite**
  - [ ] Install Vite and required plugins
  - [ ] Create `vite.config.js` with appropriate configuration
  - [ ] Configure Vite for Three.js and other dependencies
  - [ ] Set up dev server with HMR (Hot Module Replacement)
  - [ ] Remove Grunt and all grunt-related packages
  - [ ] Remove Gruntfile.js
  - [ ] Update package.json scripts to use Vite
- [ ] **Implement ES Modules**
  - [ ] Convert all JavaScript files to use ES6 import/export
  - [ ] Remove dependency on global THREE namespace
  - [ ] Properly import Three.js modules
  - [ ] Update HTML to use module script tag
- [ ] **Optimize Asset Pipeline**
  - [ ] Configure Vite to handle SCSS natively
  - [ ] Enable tree shaking for unused code removal
  - [ ] Set up code splitting for better performance
  - [ ] Implement proper asset optimization (images, fonts)

### Phase 3: Code Quality & Modern JavaScript
- [ ] **Migrate to ESLint**
  - [ ] Remove JSHint configuration
  - [ ] Install ESLint with modern presets (airbnb or standard)
  - [ ] Configure ESLint rules appropriate for the project
  - [ ] Fix all linting errors and warnings
  - [ ] Add ESLint to pre-commit hooks
- [ ] **Add Prettier for code formatting**
  - [ ] Install Prettier
  - [ ] Configure .prettierrc with team preferences
  - [ ] Format all existing code
  - [ ] Add Prettier to pre-commit hooks
- [ ] **Modernize JavaScript code**
  - [ ] Remove unnecessary Babel transpilation (modern browsers support ES6+)
  - [ ] Convert ES6 classes to use modern patterns consistently
  - [ ] Replace var with const/let throughout
  - [ ] Use async/await instead of callbacks where appropriate
  - [ ] Remove commented-out dead code
  - [ ] Add proper JSDoc comments for documentation
- [ ] **Refactor for better architecture**
  - [ ] Separate concerns (rendering, audio, UI, data loading)
  - [ ] Implement proper error handling and boundaries
  - [ ] Create reusable utility modules
  - [ ] Implement event-driven architecture where appropriate
  - [ ] Add configuration management (environment variables)

### Phase 4: TypeScript Migration (Optional but Recommended)
- [ ] **Set up TypeScript**
  - [ ] Install TypeScript and type definitions
  - [ ] Create tsconfig.json with strict mode
  - [ ] Add type definitions for Three.js and other libraries
  - [ ] Configure Vite for TypeScript
- [ ] **Incremental migration**
  - [ ] Rename .js files to .ts gradually
  - [ ] Add type annotations to classes and functions
  - [ ] Define interfaces for data structures (audio analysis, config)
  - [ ] Type the Three.js scene graph and components
  - [ ] Add generic types for reusable components

### Phase 5: Testing Infrastructure
- [ ] **Set up testing framework**
  - [ ] Install Vitest (Vite-native testing)
  - [ ] Configure test environment
  - [ ] Add test scripts to package.json
- [ ] **Write unit tests**
  - [ ] Test utility functions and helpers
  - [ ] Test data processing and analysis
  - [ ] Test audio stem management
  - [ ] Test GUI interactions
- [ ] **Add integration tests**
  - [ ] Test scene initialization
  - [ ] Test audio loading and playback
  - [ ] Test visualization rendering
- [ ] **Set up coverage reporting**
  - [ ] Configure Istanbul/c8 for coverage
  - [ ] Set coverage thresholds
  - [ ] Add coverage badges to README

### Phase 6: Development Experience
- [ ] **Improve project structure**
  - [ ] Reorganize source files into logical modules
  - [ ] Create separate directories for components, utils, types
  - [ ] Move server code to dedicated directory
  - [ ] Separate public assets from source code
- [ ] **Add development tools**
  - [ ] Set up source maps properly
  - [ ] Add debug configuration for VS Code
  - [ ] Implement proper logging system
  - [ ] Add development vs production environment handling
- [ ] **Documentation improvements**
  - [ ] Add inline code documentation (JSDoc/TSDoc)
  - [ ] Create architecture diagram
  - [ ] Document audio analysis format
  - [ ] Add contributing guidelines
  - [ ] Document build and deployment process

### Phase 7: Backend Modernization
- [ ] **Update Express server**
  - [ ] Add proper middleware organization
  - [ ] Implement error handling middleware
  - [ ] Add request validation
  - [ ] Use async/await patterns
  - [ ] Add environment variable configuration
  - [ ] Implement proper logging (Winston or similar)
- [ ] **Improve Socket.IO implementation**
  - [ ] Clean up or fully implement frame rendering feature
  - [ ] Add proper error handling for socket events
  - [ ] Implement connection/disconnection handling
  - [ ] Add authentication if needed
- [ ] **API improvements**
  - [ ] Add API versioning
  - [ ] Implement proper REST patterns
  - [ ] Add request rate limiting
  - [ ] Document API endpoints

### Phase 8: Python Processing Updates
- [ ] **Remove .pyc files from repository**
  - [ ] Delete all .pyc files
  - [ ] Add *.pyc and __pycache__/ to .gitignore
- [ ] **Modernize Python code**
  - [ ] Add requirements.txt or poetry for dependency management
  - [ ] Add type hints (Python 3.5+)
  - [ ] Update to modern Python practices (f-strings, etc.)
  - [ ] Add error handling and validation
  - [ ] Document audio processing algorithms
- [ ] **Add Python testing**
  - [ ] Set up pytest
  - [ ] Add unit tests for audio analysis
  - [ ] Test edge cases and error conditions

### Phase 9: Performance & Optimization
- [ ] **Performance profiling**
  - [ ] Profile JavaScript performance
  - [ ] Identify rendering bottlenecks
  - [ ] Optimize audio analysis data loading
  - [ ] Reduce bundle size
- [ ] **Rendering optimizations**
  - [ ] Implement object pooling for 3D objects
  - [ ] Use instanced rendering where appropriate
  - [ ] Optimize shader performance
  - [ ] Implement LOD (Level of Detail) system
- [ ] **Loading optimizations**
  - [ ] Lazy load audio files and analysis data
  - [ ] Implement progressive loading
  - [ ] Add loading progress indicators
  - [ ] Optimize asset sizes (compress textures, audio)

### Phase 10: CI/CD & Deployment
- [ ] **Set up GitHub Actions**
  - [ ] Add build workflow
  - [ ] Add linting workflow
  - [ ] Add testing workflow
  - [ ] Add deployment workflow
- [ ] **Deployment automation**
  - [ ] Set up staging environment
  - [ ] Implement automated deployments
  - [ ] Add deployment rollback capability
  - [ ] Configure CDN for assets
- [ ] **Monitoring & analytics**
  - [ ] Update Google Analytics to GA4
  - [ ] Add error tracking (Sentry or similar)
  - [ ] Implement performance monitoring
  - [ ] Add usage analytics

## Quick Start for Contributors

### Current Development Workflow
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

### Future Development Workflow (After Vite Migration)
```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## Dependencies to Consider Removing/Replacing

- **grunt** → Vite
- **grunt-contrib-jshint** → ESLint
- **grunt-contrib-uglify** → Vite (built-in)
- **grunt-contrib-watch** → Vite (built-in HMR)
- **grunt-sass** → Vite (built-in)
- **grunt-babel** → Vite (built-in) or remove (modern browsers)
- **body-parser** → Express 4.16+ has built-in body parser
- **Potentially consolidate**: dat.gui could be replaced with custom UI

## Browser Support Target

### Current
- Legacy ES5 support via Babel
- WebGL 1.0 support via Three.js v0.89

### Recommended Modern Target
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- ES2020+ native support
- WebGL 2.0 support
- No IE11 support needed

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

### Priority Order for Modernization
1. Security updates (Phase 1) - **Critical**
2. Build system migration (Phase 2) - **High Impact**
3. Code quality (Phase 3) - **High Impact**
4. Testing (Phase 5) - **Foundation for future changes**
5. TypeScript (Phase 4) - **Optional but valuable**
6. Other phases - **As needed**

## Conclusion

This is a creative and functional audio visualization project that needs modernization to meet current web development standards. The core concept and implementation are solid, but the tooling, dependencies, and code patterns are from 2018 and need updates.

The modernization can be done incrementally, starting with critical security updates and then progressively improving the build system, code quality, and developer experience. The end result will be a more maintainable, performant, and secure codebase that's easier for contributors to work with.
