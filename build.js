#!/usr/bin/env node

import pkg from './package.json' assert { type: 'json' };
import esbuild from 'esbuild';

esbuild.buildSync({
  sourcemap: true,
  platform: 'neutral',
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
  platform: 'neutral',
  bundle: true,
  sourcemap: true,
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.cjs.js',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
});

esbuild.buildSync({
  format: 'esm',
  platform: 'neutral',
  bundle: true,
  sourcemap: true,
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.esm.js',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
});
