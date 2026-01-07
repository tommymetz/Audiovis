import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'public/js/src/orbit-controls-wrapper.js',
  output: {
    file: 'public/js/orbit-controls-bundle.js',
    format: 'iife',
    name: 'OrbitControlsModule',
    globals: {
      'three': 'THREE'
    }
  },
  external: ['three'],
  plugins: [resolve()]
};
