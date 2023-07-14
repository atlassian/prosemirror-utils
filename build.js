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
  // If use `type: module` in package.json, the extension of the output file should be `.cjs`
  outfile: './dist/index.cjs',
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
