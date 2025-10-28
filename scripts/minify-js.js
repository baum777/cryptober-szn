#!/usr/bin/env node

/**
 * JavaScript Minification Script
 *
 * Minifies JavaScript files using Terser
 * Target: <20KB total where possible
 *
 * Usage: npm run js:minify
 */

import { minify } from 'terser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Terser configuration
const TERSER_CONFIG = {
  compress: {
    drop_console: false, // Keep console for debugging
    drop_debugger: true,
    pure_funcs: ['console.debug'],
    passes: 2,
    unsafe_arrows: true,
    unsafe_methods: true
  },
  mangle: {
    toplevel: false,
    keep_classnames: false,
    keep_fnames: false
  },
  format: {
    comments: false,
    ascii_only: true
  },
  sourceMap: false,
  module: true // ES6 modules
};

// JavaScript files to minify
const JS_FILES = [
  // Core boot scripts
  { input: 'js/boot-home.js', output: 'dist/js/boot-home.min.js' },
  { input: 'js/boot-lore.js', output: 'dist/js/boot-lore.min.js' },
  { input: 'js/boot-maacot.js', output: 'dist/js/boot-maacot.min.js' },

  // Main modules
  { input: 'js/main.js', output: 'dist/js/main.min.js' },
  { input: 'js/gallery.js', output: 'dist/js/gallery.min.js' },
  { input: 'js/roadmap.js', output: 'dist/js/roadmap.min.js' },
  { input: 'js/questmap.js', output: 'dist/js/questmap.min.js' },
  { input: 'js/questgrid.js', output: 'dist/js/questgrid.min.js' },
  { input: 'js/faq.js', output: 'dist/js/faq.min.js' },

  // Rail modules
  { input: 'js/mobile-rail.js', output: 'dist/js/mobile-rail.min.js' },
  { input: 'js/shared-rail.js', output: 'dist/js/shared-rail.min.js' },
  { input: 'js/lore-rail.js', output: 'dist/js/lore-rail.min.js' },

  // Components
  { input: 'js/components/QuestCard.js', output: 'dist/js/components/QuestCard.min.js' },
  { input: 'js/components/QuestMapSection.js', output: 'dist/js/components/QuestMapSection.min.js' },
  { input: 'js/components/RoadmapStepCard.js', output: 'dist/js/components/RoadmapStepCard.min.js' },
  { input: 'js/components/StatusGlyph.js', output: 'dist/js/components/StatusGlyph.min.js' },
  { input: 'js/components/TimelineSection.js', output: 'dist/js/components/TimelineSection.min.js' },

  // Utils
  { input: 'utils/a11y.js', output: 'dist/js/utils/a11y.min.js' },
  { input: 'utils/motion.js', output: 'dist/js/utils/motion.min.js' },

  // Specialized
  { input: 'src/js/lightbox.js', output: 'dist/js/lightbox.min.js' }
];

/**
 * Minify a single JavaScript file
 */
async function minifyJS(inputPath, outputPath) {
  try {
    console.log(`\n⚙️  Processing: ${inputPath}`);

    // Read JavaScript
    const code = await fs.readFile(inputPath, 'utf-8');
    const originalSize = Buffer.byteLength(code, 'utf-8');

    // Minify with Terser
    const result = await minify(code, TERSER_CONFIG);

    if (result.error) {
      throw result.error;
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Write minified JS
    await fs.writeFile(outputPath, result.code);

    const minifiedSize = Buffer.byteLength(result.code, 'utf-8');
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    console.log(`  ✓ Original: ${(originalSize / 1024).toFixed(1)}KB`);
    console.log(`  ✓ Minified: ${(minifiedSize / 1024).toFixed(1)}KB`);
    console.log(`  ✓ Savings: ${savings}%`);

    return {
      input: path.basename(inputPath),
      originalSize,
      minifiedSize,
      savings: parseFloat(savings)
    };

  } catch (err) {
    console.error(`  ✗ Failed to minify ${inputPath}: ${err.message}`);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('⚙️  JavaScript Minification Pipeline\n');
  console.log('════════════════════════════════════════════════════════\n');

  const results = [];

  for (const file of JS_FILES) {
    const inputPath = path.join(ROOT, file.input);
    const outputPath = path.join(ROOT, file.output);

    // Check if input file exists
    try {
      await fs.access(inputPath);
    } catch {
      console.warn(`⚠️  File not found: ${file.input} - skipping`);
      continue;
    }

    const result = await minifyJS(inputPath, outputPath);
    if (result) {
      results.push(result);
    }
  }

  // Summary
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalMinified = results.reduce((sum, r) => sum + r.minifiedSize, 0);
  const totalSavings = ((1 - totalMinified / totalOriginal) * 100).toFixed(1);

  console.log('\n════════════════════════════════════════════════════════');
  console.log('📊 JavaScript Minification Summary\n');
  console.log(`Total files processed: ${results.length}`);
  console.log(`Original size: ${(totalOriginal / 1024).toFixed(1)}KB`);
  console.log(`Minified size: ${(totalMinified / 1024).toFixed(1)}KB`);
  console.log(`Total savings: ${totalSavings}%`);

  // Warn if total JS is too large
  if (totalMinified > 100 * 1024) {
    console.log(`\n⚠️  Total minified JS is ${(totalMinified / 1024).toFixed(1)}KB`);
    console.log(`   Consider code-splitting or lazy-loading non-critical modules`);
  }

  console.log('\n✅ JavaScript minification complete!');
  console.log(`📦 Output: dist/js/\n`);
}

// Run
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
