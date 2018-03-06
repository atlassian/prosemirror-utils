import babel from 'rollup-plugin-babel';

export default {
  input: './src/index.js',
  output: {
    format: 'cjs',
    file: 'dist/index.js',
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ],
  external(id) {
    return !/^[\.\/]/.test(id);
  }
};
