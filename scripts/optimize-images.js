#!/usr/bin/env node
/**
 * Image Optimization Script for Cryptober
 * Converts PNG/JPG images to WebP and AVIF formats with multiple sizes
 * Usage: npm run images:optimize
 */

import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Configuration
const CONFIG = {
  sourceDirs: [
    'assets/gallery',
    'assets/heros-journey',
    'assets/mascot',
  ],
  sourceSubdir: 'originals',
  outputSubdir: 'optimized',
  sizes: [320, 768, 1200], // Mobile, Tablet, Desktop
  formats: ['webp', 'avif'],
  quality: {
    webp: 75,
    avif: 65,
  },
  maxSizeKB: 100,
};

/**
 * Checks if @squoosh/cli is available
 */
async function checkSquoosh() {
  return new Promise((resolve) => {
    const check = spawn('npx', ['--version'], { shell: true });
    check.on('close', (code) => resolve(code === 0));
  });
}

/**
 * Optimizes a single image to WebP/AVIF with multiple sizes
 */
async function optimizeImage(inputPath, outputDir, filename) {
  const ext = extname(filename).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    console.log(`⏭️  Skipping ${filename} (not PNG/JPG)`);
    return;
  }

  console.log(`\n🖼️  Processing: ${filename}`);
  const baseName = basename(filename, ext);

  for (const size of CONFIG.sizes) {
    for (const format of CONFIG.formats) {
      const outputFilename = `${baseName}-${size}w.${format}`;
      const outputPath = join(outputDir, outputFilename);

      // Build squoosh command
      const quality = CONFIG.quality[format];
      const args = [
        '@squoosh/cli',
        '--resize', `{width:${size}}`,
      ];

      if (format === 'webp') {
        args.push('--webp', `{quality:${quality}}`);
      } else if (format === 'avif') {
        args.push('--avif', `{cqLevel:${100 - quality}}`);
      }

      args.push('-d', outputDir, inputPath);

      try {
        await runCommand('npx', args);
        
        // Check file size
        const stats = await fs.stat(outputPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        const status = stats.size <= CONFIG.maxSizeKB * 1024 ? '✅' : '⚠️';
        console.log(`  ${status} ${outputFilename} → ${sizeKB}KB`);
      } catch (error) {
        console.error(`  ❌ Failed to create ${outputFilename}:`, error.message);
      }
    }
  }
}

/**
 * Runs a shell command
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { shell: true, stdio: 'pipe' });
    let stderr = '';

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Main optimization routine
 */
async function main() {
  console.log('🚀 Cryptober Image Optimization\n');

  // Check if squoosh is available
  const hasSquoosh = await checkSquoosh();
  if (!hasSquoosh) {
    console.error('❌ @squoosh/cli not found. Run: npm install');
    process.exit(1);
  }

  let totalProcessed = 0;
  let totalSkipped = 0;

  for (const dir of CONFIG.sourceDirs) {
    const sourceDir = join(ROOT, dir, CONFIG.sourceSubdir);
    const outputDir = join(ROOT, dir, CONFIG.outputSubdir);

    console.log(`\n📁 Processing: ${dir}/`);

    // Check if source directory exists
    try {
      await fs.access(sourceDir);
    } catch {
      console.log(`  ⏭️  No originals folder found, skipping...`);
      continue;
    }

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Get all images in source directory
    const files = await fs.readdir(sourceDir);
    const imageFiles = files.filter(f => 
      ['.png', '.jpg', '.jpeg'].includes(extname(f).toLowerCase())
    );

    if (imageFiles.length === 0) {
      console.log(`  ℹ️  No images found in ${sourceDir}`);
      totalSkipped++;
      continue;
    }

    // Process each image
    for (const file of imageFiles) {
      const inputPath = join(sourceDir, file);
      await optimizeImage(inputPath, outputDir, file);
      totalProcessed++;
    }
  }

  console.log(`\n✨ Optimization complete!`);
  console.log(`   Processed: ${totalProcessed} images`);
  console.log(`   Skipped: ${totalSkipped} directories`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Run: npm run svg:optimize`);
  console.log(`   2. Run: npm run css:minify`);
  console.log(`   3. Run: npm run js:minify`);
  console.log(`   4. Or run all: npm run assets:build\n`);
}

main().catch(error => {
  console.error('❌ Optimization failed:', error);
  process.exit(1);
});
