#!/usr/bin/env node

/**
 * SVG Optimization Script
 *
 * Optimizes SVG files using SVGO while preserving:
 * - viewBox attributes
 * - stroke properties
 * - monoline stroke width (1.8-2.0px)
 *
 * Usage: npm run svg:optimize
 */

import { optimize } from 'svgo';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// SVGO configuration
const SVGO_CONFIG = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Preserve viewBox - critical for responsive SVGs
          removeViewBox: false,
          // Preserve IDs that might be referenced
          cleanupIDs: {
            remove: false,
            minify: false
          }
        }
      }
    },
    // Remove unnecessary metadata
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',

    // Clean up attributes but preserve critical ones
    {
      name: 'removeUnknownsAndDefaults',
      params: {
        keepDataAttrs: false,
        keepRoleAttr: true
      }
    },

    // Optimize paths but preserve precision for crisp lines
    {
      name: 'convertPathData',
      params: {
        floatPrecision: 2,
        transformPrecision: 3
      }
    },

    // Clean up empty elements
    'removeEmptyContainers',
    'removeEmptyAttrs',

    // Merge paths where safe
    'mergePaths',

    // Convert basic shapes to paths for better compression
    'convertShapeToPath',

    // Remove hidden elements
    'removeHiddenElems',

    // Sort attributes for better gzip
    'sortAttrs',

    // Minify styles
    {
      name: 'minifyStyles',
      params: {
        usage: true
      }
    }
  ]
};

// Source directories
const SVG_DIRS = [
  'assets/roadmap',
  'assets/socials',
  'assets/favicons'
];

/**
 * Get all SVG files from source directories
 */
async function getSVGFiles() {
  const svgs = [];

  for (const dir of SVG_DIRS) {
    const fullPath = path.join(ROOT, dir);

    try {
      const files = await fs.readdir(fullPath);

      for (const file of files) {
        if (/\.svg$/i.test(file)) {
          const filePath = path.join(fullPath, file);
          const stat = await fs.stat(filePath);

          svgs.push({
            path: filePath,
            name: file,
            dir: dir,
            size: stat.size
          });
        }
      }
    } catch (err) {
      console.warn(`⚠️  Could not read directory ${dir}: ${err.message}`);
    }
  }

  return svgs;
}

/**
 * Optimize a single SVG file
 */
async function optimizeSVG(svg) {
  try {
    // Read SVG content
    const content = await fs.readFile(svg.path, 'utf-8');

    // Optimize
    const result = optimize(content, {
      path: svg.path,
      ...SVGO_CONFIG
    });

    if (result.error) {
      throw new Error(result.error);
    }

    // Calculate output directory
    const relativeDir = svg.dir.replace('assets/', '');
    const outputDir = path.join(ROOT, 'assets', 'optimized', relativeDir);
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, svg.name);

    // Write optimized SVG
    await fs.writeFile(outputPath, result.data);

    const outputStat = await fs.stat(outputPath);
    const savings = ((1 - outputStat.size / svg.size) * 100).toFixed(1);

    console.log(`  ✓ ${svg.name}`);
    console.log(`    Original: ${(svg.size / 1024).toFixed(1)}KB`);
    console.log(`    Optimized: ${(outputStat.size / 1024).toFixed(1)}KB`);
    console.log(`    Savings: ${savings}%`);

    return {
      name: svg.name,
      originalSize: svg.size,
      optimizedSize: outputStat.size,
      savings: parseFloat(savings)
    };

  } catch (err) {
    console.error(`  ✗ ${svg.name} failed: ${err.message}`);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 SVG Optimization Pipeline\n');
  console.log('════════════════════════════════════════════════════════\n');

  const svgs = await getSVGFiles();

  if (svgs.length === 0) {
    console.log('ℹ️  No SVG files found to optimize');
    return;
  }

  console.log(`Found ${svgs.length} SVG files to optimize\n`);

  const results = [];

  for (const svg of svgs) {
    console.log(`\n🔧 Processing: ${svg.name} (${(svg.size / 1024).toFixed(1)}KB)`);
    const result = await optimizeSVG(svg);
    if (result) {
      results.push(result);
    }
  }

  // Summary
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
  const totalSavings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);

  console.log('\n════════════════════════════════════════════════════════');
  console.log('📊 SVG Optimization Summary\n');
  console.log(`Total SVGs processed: ${results.length}`);
  console.log(`Original size: ${(totalOriginal / 1024).toFixed(1)}KB`);
  console.log(`Optimized size: ${(totalOptimized / 1024).toFixed(1)}KB`);
  console.log(`Total savings: ${totalSavings}%`);

  // Identify files still large
  const largeFiles = results.filter(r => r.optimizedSize > 100 * 1024);
  if (largeFiles.length > 0) {
    console.log('\n⚠️  Large SVG files (>100KB):');
    largeFiles.forEach(f => {
      console.log(`  - ${f.name}: ${(f.optimizedSize / 1024).toFixed(1)}KB`);
      console.log(`    → May contain embedded raster data or complex paths`);
    });
  }

  console.log('\n✅ SVG optimization complete!\n');
}

// Run
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
