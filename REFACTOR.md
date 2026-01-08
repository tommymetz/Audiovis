# REFACTOR.md - Audiovis 1.0 Horizon Modernization Guide

This document outlines the modernization roadmap and future development plans for the Audiovis 1.0 Horizon project. For information about the current setup, see [AGENTS.md](AGENTS.md).

## Modernization Roadmap

### Phase 1: Essential Security & Maintenance
- [x] **1.0 Update Node.js dependencies** to address security vulnerabilities
  - [x] 1.0.0 Upgrade Socket.IO from v2.1.1 to v4.x (multiple security advisories) - Now at v4.8.3
  - [x] 1.0.1 Update Express to v4.x latest (security patches) - Now at v4.22.1
  - [x] 1.0.2 Replace deprecated `new Buffer()` with `Buffer.from()` in `index.js` - Already using Buffer.from()
  - [x] 1.0.3 Update dependencies with known security vulnerabilities or critical patches (reduced from 4 to 1, only three.js remains)
  - [x] 1.0.4 Update dependencies that are 2+ major versions behind latest stable (all updated except express 5.x and three.js)
- [x] **1.1 Update Three.js** from v0.89.0 to v0.145.0 (last version with UMD build)
  - [x] 1.1.0 Update Three.js imports and API usage
  - [x] 1.1.1 Replace deprecated OrbitControls import (path unchanged in v0.145.0)
  - [x] 1.1.2 Update Detector.js usage (now built-in)
- [x] **1.2 Improve .gitignore**
  - [x] 1.2.0 Add Python .pyc files and __pycache__ directories
  - [x] 1.2.1 Add build output directories (dist, public/js/dist)
  - [x] 1.2.2 Add IDE-specific files (.vscode, .idea)
  - [x] 1.2.3 Add OS-specific files (.DS_Store handled, add Thumbs.db)

### Phase 2: Modern Build System Migration
- [ ] **2.0 Migrate from Grunt to Vite**
  - [ ] 2.0.0 Install Vite and required plugins
  - [ ] 2.0.1 Create `vite.config.js` with appropriate configuration
  - [ ] 2.0.2 Configure Vite for Three.js and other dependencies
  - [ ] 2.0.3 Set up dev server with HMR (Hot Module Replacement)
  - [ ] 2.0.4 Remove Grunt and all grunt-related packages
  - [ ] 2.0.5 Remove Gruntfile.js
  - [ ] 2.0.6 Update package.json scripts to use Vite
- [ ] **2.1 Implement ES Modules**
  - [ ] 2.1.0 Convert all JavaScript files to use ES6 import/export
  - [ ] 2.1.1 Remove dependency on global THREE namespace
  - [ ] 2.1.2 Properly import Three.js modules
  - [ ] 2.1.3 Update HTML to use module script tag
- [ ] **2.2 Optimize Asset Pipeline**
  - [ ] 2.2.0 Configure Vite to handle SCSS natively
  - [ ] 2.2.1 Enable tree shaking for unused code removal
  - [ ] 2.2.2 Set up code splitting for better performance
  - [ ] 2.2.3 Implement proper asset optimization (images, fonts)

### Phase 3: Code Quality & Modern JavaScript
- [ ] **3.0 Migrate to ESLint**
  - [ ] 3.0.0 Remove JSHint configuration
  - [ ] 3.0.1 Install ESLint with modern presets (airbnb or standard)
  - [ ] 3.0.2 Configure ESLint rules appropriate for the project
  - [ ] 3.0.3 Fix all linting errors and warnings
  - [ ] 3.0.4 Add ESLint to pre-commit hooks
- [ ] **3.1 Add Prettier for code formatting**
  - [ ] 3.1.0 Install Prettier
  - [ ] 3.1.1 Configure .prettierrc with team preferences
  - [ ] 3.1.2 Format all existing code
  - [ ] 3.1.3 Add Prettier to pre-commit hooks
- [ ] **3.2 Modernize JavaScript code**
  - [ ] 3.2.0 Remove unnecessary Babel transpilation (modern browsers support ES6+)
  - [ ] 3.2.1 Convert ES6 classes to use modern patterns consistently
  - [ ] 3.2.2 Replace var with const/let throughout
  - [ ] 3.2.3 Use async/await instead of callbacks where appropriate
  - [ ] 3.2.4 Remove commented-out dead code
  - [ ] 3.2.5 Add proper JSDoc comments for documentation
- [ ] **3.3 Refactor for better architecture**
  - [ ] 3.3.0 Separate concerns (rendering, audio, UI, data loading)
  - [ ] 3.3.1 Implement proper error handling and boundaries
  - [ ] 3.3.2 Create reusable utility modules
  - [ ] 3.3.3 Implement event-driven architecture where appropriate
  - [ ] 3.3.4 Add configuration management (environment variables)

### Phase 4: TypeScript Migration (Optional but Recommended)
- [ ] **4.0 Set up TypeScript**
  - [ ] 4.0.0 Install TypeScript and type definitions
  - [ ] 4.0.1 Create tsconfig.json with strict mode
  - [ ] 4.0.2 Add type definitions for Three.js and other libraries
  - [ ] 4.0.3 Configure Vite for TypeScript
- [ ] **4.1 Incremental migration**
  - [ ] 4.1.0 Rename .js files to .ts gradually
  - [ ] 4.1.1 Add type annotations to classes and functions
  - [ ] 4.1.2 Define interfaces for data structures (audio analysis, config)
  - [ ] 4.1.3 Type the Three.js scene graph and components
  - [ ] 4.1.4 Add generic types for reusable components

### Phase 5: Testing Infrastructure
- [ ] **5.0 Set up testing framework**
  - [ ] 5.0.0 Install Vitest (Vite-native testing)
  - [ ] 5.0.1 Configure test environment
  - [ ] 5.0.2 Add test scripts to package.json
- [ ] **5.1 Write unit tests**
  - [ ] 5.1.0 Test utility functions and helpers
  - [ ] 5.1.1 Test data processing and analysis
  - [ ] 5.1.2 Test audio stem management
  - [ ] 5.1.3 Test GUI interactions
- [ ] **5.2 Add integration tests**
  - [ ] 5.2.0 Test scene initialization
  - [ ] 5.2.1 Test audio loading and playback
  - [ ] 5.2.2 Test visualization rendering
- [ ] **5.3 Set up coverage reporting**
  - [ ] 5.3.0 Configure Istanbul/c8 for coverage
  - [ ] 5.3.1 Set coverage thresholds
  - [ ] 5.3.2 Add coverage badges to README

### Phase 6: Development Experience
- [ ] **6.0 Improve project structure**
  - [ ] 6.0.0 Reorganize source files into logical modules
  - [ ] 6.0.1 Create separate directories for components, utils, types
  - [ ] 6.0.2 Move server code to dedicated directory
  - [ ] 6.0.3 Separate public assets from source code
- [ ] **6.1 Add development tools**
  - [ ] 6.1.0 Set up source maps properly
  - [ ] 6.1.1 Add debug configuration for VS Code
  - [ ] 6.1.2 Implement proper logging system
  - [ ] 6.1.3 Add development vs production environment handling
- [ ] **6.2 Documentation improvements**
  - [ ] 6.2.0 Add inline code documentation (JSDoc/TSDoc)
  - [ ] 6.2.1 Create architecture diagram
  - [ ] 6.2.2 Document audio analysis format
  - [ ] 6.2.3 Add contributing guidelines
  - [ ] 6.2.4 Document build and deployment process

### Phase 7: Backend Modernization
- [ ] **7.0 Update Express server**
  - [ ] 7.0.0 Add proper middleware organization
  - [ ] 7.0.1 Implement error handling middleware
  - [ ] 7.0.2 Add request validation
  - [ ] 7.0.3 Use async/await patterns
  - [ ] 7.0.4 Add environment variable configuration
  - [ ] 7.0.5 Implement proper logging (Winston or similar)
- [ ] **7.1 Improve Socket.IO implementation**
  - [ ] 7.1.0 Clean up or fully implement frame rendering feature
  - [ ] 7.1.1 Add proper error handling for socket events
  - [ ] 7.1.2 Implement connection/disconnection handling
  - [ ] 7.1.3 Add authentication if needed
- [ ] **7.2 API improvements**
  - [ ] 7.2.0 Add API versioning
  - [ ] 7.2.1 Implement proper REST patterns
  - [ ] 7.2.2 Add request rate limiting
  - [ ] 7.2.3 Document API endpoints

### Phase 8: Python Processing Updates
- [ ] **8.0 Remove .pyc files from repository**
  - [ ] 8.0.0 Delete all .pyc files
  - [ ] 8.0.1 Add *.pyc and __pycache__/ to .gitignore
- [ ] **8.1 Modernize Python code**
  - [ ] 8.1.0 Add requirements.txt or poetry for dependency management
  - [ ] 8.1.1 Add type hints (Python 3.5+)
  - [ ] 8.1.2 Update to modern Python practices (f-strings, etc.)
  - [ ] 8.1.3 Add error handling and validation
  - [ ] 8.1.4 Document audio processing algorithms
- [ ] **8.2 Add Python testing**
  - [ ] 8.2.0 Set up pytest
  - [ ] 8.2.1 Add unit tests for audio analysis
  - [ ] 8.2.2 Test edge cases and error conditions

### Phase 9: Performance & Optimization
- [ ] **9.0 Performance profiling**
  - [ ] 9.0.0 Profile JavaScript performance
  - [ ] 9.0.1 Identify rendering bottlenecks
  - [ ] 9.0.2 Optimize audio analysis data loading
  - [ ] 9.0.3 Reduce bundle size
- [ ] **9.1 Rendering optimizations**
  - [ ] 9.1.0 Implement object pooling for 3D objects
  - [ ] 9.1.1 Use instanced rendering where appropriate
  - [ ] 9.1.2 Optimize shader performance
  - [ ] 9.1.3 Implement LOD (Level of Detail) system
- [ ] **9.2 Loading optimizations**
  - [ ] 9.2.0 Lazy load audio files and analysis data
  - [ ] 9.2.1 Implement progressive loading
  - [ ] 9.2.2 Add loading progress indicators
  - [ ] 9.2.3 Optimize asset sizes (compress textures, audio)

### Phase 10: CI/CD & Deployment
- [ ] **10.0 Set up GitHub Actions**
  - [ ] 10.0.0 Add build workflow
  - [ ] 10.0.1 Add linting workflow
  - [ ] 10.0.2 Add testing workflow
  - [ ] 10.0.3 Add deployment workflow
- [ ] **10.1 Deployment automation**
  - [ ] 10.1.0 Set up staging environment
  - [ ] 10.1.1 Implement automated deployments
  - [ ] 10.1.2 Add deployment rollback capability
  - [ ] 10.1.3 Configure CDN for assets
- [ ] **10.2 Monitoring & analytics**
  - [ ] 10.2.0 Update Google Analytics to GA4
  - [ ] 10.2.1 Add error tracking (Sentry or similar)
  - [ ] 10.2.2 Implement performance monitoring
  - [ ] 10.2.3 Add usage analytics

## Future Development Workflow (After Vite Migration)

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

### Recommended Modern Target
- Modern browsers from the last 2-3 years (evergreen browsers with auto-updates)
  - Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ (as of 2024)
  - Update these versions as time progresses
- ES2020+ native support (or latest stable ECMAScript features)
- WebGL 2.0 support
- No IE11 support needed

## Priority Order for Modernization

1. Security updates (Phase 1) - **Critical**
2. Build system migration (Phase 2) - **High Impact**
3. Code quality (Phase 3) - **High Impact**
4. Testing (Phase 5) - **Foundation for future changes**
5. TypeScript (Phase 4) - **Optional but valuable**
6. Other phases - **As needed**

## Conclusion

This is a creative and functional audio visualization project that needs modernization to meet current web development standards. The core concept and implementation are solid, but the tooling, dependencies, and code patterns are from 2018 and need updates.

The modernization can be done incrementally, starting with critical security updates and then progressively improving the build system, code quality, and developer experience. The end result will be a more maintainable, performant, and secure codebase that's easier for contributors to work with.
