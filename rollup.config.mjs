import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';

import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default [
  // ESM and CJS builds for React usage
  {
    input: 'src/lib.js',
    output: [
      {
        file: './dist/access-qa-bot.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: './dist/access-qa-bot.umd.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      }
    ],
    plugins: [
      peerDepsExternal(),
      postcss({
        extensions: ['.css'],
        minimize: true,
        inject: {
          insertAt: 'top',
        },
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env', '@babel/preset-react'],
      }),
      resolve({
        extensions: ['.js', '.jsx'],
        mainFields: ['module', 'main', 'browser']
      }),
      commonjs(),
      terser(),
    ],
    external: Object.keys(pkg.peerDependencies || {})
  },

  // UMD build with React bundled for standalone use - now React-backed
  {
    input: 'src/standalone.js',
    output: {
      file: './dist/access-qa-bot.standalone.js',
      format: 'umd',
      name: 'qaBot',
      sourcemap: true,
      exports: 'default',
      globals: {}
    },
    plugins: [
      postcss({
        extensions: ['.css'],
        minimize: true,
        inject: {
          insertAt: 'top',
        },
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env', '@babel/preset-react'],
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        // Replace react app environment variables
        'process.env.REACT_APP_API_KEY': JSON.stringify('demo-key'),
        'process.env.REACT_APP_NETLIFY_BASE_URL': JSON.stringify('https://access-jsm-api.netlify.app')
      }),
      resolve({
        extensions: ['.js', '.jsx'],
        alias: {
          'react': 'preact/compat',
          'react-dom': 'preact/compat',
          'react-dom/client': 'preact/compat/client'
        },
        mainFields: ['module', 'main', 'browser']
      }),
      commonjs(),
      terser(),
    ],
    // Don't exclude peer dependencies for the standalone build
    external: []
  }
];