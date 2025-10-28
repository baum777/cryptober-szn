#!/usr/bin/env node

/**
 * CSS Minification Script
 *
 * Minifies CSS files using PostCSS + cssnano
 * Target: <50KB for main stylesheet
 *
 * Usage: npm run css:minify
 */

import postcss from 'postcss';
import cssnano from 'cssnano';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Configuration
const CSS_FILES = [
  {
    input: 'styles.css',
    output: 'dist/css/style.min.css'
  }
];

/**
 * Minify a single CSS file
 */
async function minifyCSS(inputPath, outputPath) {
  try {
    console.log(`\n🎨 Processing: ${inputPath}`);

    // Read CSS
    const css = await fs.readFile(inputPath, 'utf-8');
    const originalSize = Buffer.byteLength(css, 'utf-8');

    // Process with PostCSS
    const result = await postcss([
      cssnano({
        preset: [
          'default',
          {
            calc: false,
            reduceIdents: false,
            normalizeWhitespace: true,
            discardComments: { removeAll: true },
            mergeRules: true,
            minifySelectors: true,
            minifyFontValues: true,
            colormin: true,
            normalizeUrl: true,
            discardDuplicates: true,
            discardEmpty: true,
            zindex: false,
            sortMediaQueries: true
          }
        ]
      })
    ]).process(css, {
      from: inputPath,
      to: outputPath
    });

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Write minified CSS
    await fs.writeFile(outputPath, result.css);

    const minifiedSize = Buffer.byteLength(result.css, 'utf-8');
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    console.log(`  ✓ Original: ${(originalSize / 1024).toFixed(1)}KB`);
    console.log(`  ✓ Minified: ${(minifiedSize / 1024).toFixed(1)}KB`);
    console.log(`  ✓ Savings: ${savings}%`);

    // Warn if still large
    if (minifiedSize > 50 * 1024) {
      console.log(`  ⚠️  Warning: Minified CSS is ${(minifiedSize / 1024).toFixed(1)}KB (target: <50KB)`);
      console.log(`     Consider code-splitting or removing unused styles`);
    }

    return {
      input: path.basename(inputPath),
      originalSize,
      minifiedSize,
      savings: parseFloat(savings)
    };

  } catch (err) {
    console.error(`  ✗ Failed to minify ${inputPath}: ${err.message}`);
    throw err;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 CSS Minification Pipeline\n');
  console.log('════════════════════════════════════════════════════════\n');

  const results = [];

  for (const file of CSS_FILES) {
    const inputPath = path.join(ROOT, file.input);
    const outputPath = path.join(ROOT, file.output);

    const result = await minifyCSS(inputPath, outputPath);
    results.push(result);
  }

  // Summary
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalMinified = results.reduce((sum, r) => sum + r.minifiedSize, 0);
  const totalSavings = ((1 - totalMinified / totalOriginal) * 100).toFixed(1);

  console.log('\n════════════════════════════════════════════════════════');
  console.log('📊 CSS Minification Summary\n');
  console.log(`Total files processed: ${results.length}`);
  console.log(`Original size: ${(totalOriginal / 1024).toFixed(1)}KB`);
  console.log(`Minified size: ${(totalMinified / 1024).toFixed(1)}KB`);
  console.log(`Total savings: ${totalSavings}%`);
  console.log('\n✅ CSS minification complete!');
  console.log(`📦 Output: dist/css/style.min.css\n`);
}

// Run
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
