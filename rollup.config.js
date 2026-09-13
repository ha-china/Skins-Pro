import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

const production = !process.env.ROLLUP_WATCH;

// Placed AFTER terser so the banner survives minification.
const stamp = {
  name: 'stamp',
  renderChunk(code) {
    return { code: `/* Skins-Pro v${version} ${new Date().toISOString()} */\n${code}`, map: null };
  }
};

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/skins-pro.js',
    format: 'es',
    sourcemap: !production,
    inlineDynamicImports: true
  },
  plugins: [
    nodeResolve({ browser: true, preferBuiltins: false }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json', sourceMap: !production }),
    production && terser({ format: { comments: false } }),
    stamp
  ].filter(Boolean)
};
