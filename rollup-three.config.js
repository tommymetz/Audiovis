import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'public/js/src/three-wrapper.js',
  output: {
    file: 'public/js/three-bundle.js',
    format: 'iife',
    name: 'THREE'
  },
  plugins: [resolve()]
};
