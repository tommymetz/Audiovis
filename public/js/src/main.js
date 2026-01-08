// Main entry point for the Audiovis application
// This file imports all dependencies and source files for Vite bundling

// Third-party dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';
import * as dat from 'dat.gui';
import Sortable from 'sortablejs';

// Create a new THREE object that extends the imported one (since imports are frozen)
const THREEExtended = Object.assign({}, THREE);
THREEExtended.OrbitControls = OrbitControls;

// Expose libraries to global scope for compatibility with existing code
window.THREE = THREEExtended;
window.Stats = Stats;
window.dat = dat;
window.Sortable = Sortable;

// Import SCSS styles
import '../../css/scss/main.scss';

// Import application source files in dependency order
// Colors first (no dependencies)
import './colors/colorsWarmCold.js';

// Models (depend on THREE)
import './models/helper.js';
import './models/spectrum.js';
import './models/triangles.js';

// GUI classes (depend on THREE, Sortable, dat.gui)
import './scene_gui.js';
import './song_gui.js';

// Core classes (depend on models, GUI, and THREE)
import './stem.js';
import './song.js';
import './scene.js';
