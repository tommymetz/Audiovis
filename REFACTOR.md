# REFACTOR.md - Audiovis 1.0 Horizon Modernization Guide

This document outlines the modernization roadmap and future development plans for the Audiovis 1.0 Horizon project. For information about the current setup, see [AGENTS.md](AGENTS.md).

## Modernization Roadmap

### Phase 1: Essential Security & Maintenance
- [ ] **Update Node.js dependencies** to address security vulnerabilities
  - [ ] Upgrade Socket.IO from v2.1.1 to v4.x (multiple security advisories)
  - [ ] Update Express to v4.x latest (security patches)
  - [ ] Replace deprecated `new Buffer()` with `Buffer.from()` in `index.js`
  - [ ] Update dependencies with known security vulnerabilities or critical patches
  - [ ] Update dependencies that are 2+ major versions behind latest stable
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
