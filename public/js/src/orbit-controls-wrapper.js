import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Attach to THREE namespace for compatibility
if (typeof THREE !== 'undefined') {
  THREE.OrbitControls = OrbitControls;
}

export { OrbitControls };
