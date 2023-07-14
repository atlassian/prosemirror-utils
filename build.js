#!/usr/bin/env node

import pkg from './package.json' assert { type: 'json' };
import esbuild from 'esbuild';

esbuild.buildSync({
  sourcemap: true,
  bundle: true,
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
});

esbuild.buildSync({
  format: 'cjs',
  bundle: true,
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.cjs.js',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
});
