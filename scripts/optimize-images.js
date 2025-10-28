#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Converts PNG/JPEG images to WebP and AVIF formats
 * Generates responsive sizes: 320w, 768w, 1200w
 * Target: <100KB per image where possible
 *
 * Usage: npm run images:optimize
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  // Source directories (relative to project root)
  sourceDirs: [
    'assets/gallery',
    'assets/heros-journey',
    'assets/mascot',
    'assets/socials'
  ],

  // Output directory
  outputBase: 'assets/optimized',

  // Responsive widths
  widths: [320, 768, 1200],

  // Quality settings
  webp: {
    quality: 75,
    effort: 6
  },
  avif: {
    quality: 50,
    effort: 6,
    chromaSubsampling: '4:2:0'
  },

  // Skip already optimized files
  skipPatterns: [/\.webp$/i, /\.avif$/i, /optimized/i]
};

/**
 * Get all image files from source directories
 */
async function getImageFiles() {
  const images = [];

  for (const dir of CONFIG.sourceDirs) {
    const fullPath = path.join(ROOT, dir);

    try {
      const files = await fs.readdir(fullPath);

      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile() && /\.(png|jpe?g)$/i.test(file)) {
          // Skip if matches skip patterns
          if (CONFIG.skipPatterns.some(pattern => pattern.test(filePath))) {
            continue;
          }

          images.push({
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

  return images;
}

/**
 * Optimize a single image
 */
async function optimizeImage(image) {
  const baseName = path.parse(image.name).name;
  const relativeDir = image.dir.replace('assets/', '');
  const outputDir = path.join(ROOT, CONFIG.outputBase, relativeDir);

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`\n📸 Processing: ${image.name} (${(image.size / 1024 / 1024).toFixed(2)}MB)`);

  const results = [];

  // Generate responsive sizes for WebP
  for (const width of CONFIG.widths) {
    const outputPath = path.join(outputDir, `${baseName}-${width}w.webp`);

    try {
      await sharp(image.path)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp(CONFIG.webp)
        .toFile(outputPath);

      const stat = await fs.stat(outputPath);
      results.push({
        format: 'webp',
        width,
        size: stat.size,
        path: outputPath
      });

      console.log(`  ✓ WebP ${width}w: ${(stat.size / 1024).toFixed(1)}KB`);
    } catch (err) {
      console.error(`  ✗ WebP ${width}w failed: ${err.message}`);
    }
  }

  // Generate responsive sizes for AVIF
  for (const width of CONFIG.widths) {
    const outputPath = path.join(outputDir, `${baseName}-${width}w.avif`);

    try {
      await sharp(image.path)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .avif(CONFIG.avif)
        .toFile(outputPath);

      const stat = await fs.stat(outputPath);
      results.push({
        format: 'avif',
        width,
        size: stat.size,
        path: outputPath
      });

      console.log(`  ✓ AVIF ${width}w: ${(stat.size / 1024).toFixed(1)}KB`);
    } catch (err) {
      console.error(`  ✗ AVIF ${width}w failed: ${err.message}`);
    }
  }

  return results;
}

/**
 * Generate HTML snippets for responsive images
 */
function generateHTMLSnippet(imageName, dir) {
  const baseName = path.parse(imageName).name;
  const relativeDir = dir.replace('assets/', '');
  const optimizedPath = `/assets/optimized/${relativeDir}`;

  return `
<!-- Responsive image: ${imageName} -->
<picture>
  <source
    type="image/avif"
    srcset="${optimizedPath}/${baseName}-320w.avif 320w,
            ${optimizedPath}/${baseName}-768w.avif 768w,
            ${optimizedPath}/${baseName}-1200w.avif 1200w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
  <source
    type="image/webp"
    srcset="${optimizedPath}/${baseName}-320w.webp 320w,
            ${optimizedPath}/${baseName}-768w.webp 768w,
            ${optimizedPath}/${baseName}-1200w.webp 1200w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
  <img
    src="${optimizedPath}/${baseName}-768w.webp"
    alt="[Add descriptive alt text]"
    loading="lazy"
    decoding="async"
    width="768"
    height="auto"
  />
</picture>
`;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Image Optimization Pipeline\n');
  console.log('════════════════════════════════════════════════════════\n');

  const images = await getImageFiles();

  if (images.length === 0) {
    console.log('ℹ️  No images found to optimize');
    return;
  }

  console.log(`Found ${images.length} images to optimize\n`);

  const stats = {
    totalOriginal: 0,
    totalOptimized: 0,
    images: []
  };

  for (const image of images) {
    const results = await optimizeImage(image);

    stats.totalOriginal += image.size;
    stats.totalOptimized += results.reduce((sum, r) => sum + r.size, 0);
    stats.images.push({
      name: image.name,
      original: image.size,
      optimized: results
    });
  }

  // Summary
  console.log('\n════════════════════════════════════════════════════════');
  console.log('📊 Optimization Summary\n');
  console.log(`Total images processed: ${images.length}`);
  console.log(`Original size: ${(stats.totalOriginal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Optimized size: ${(stats.totalOptimized / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Savings: ${((1 - stats.totalOptimized / stats.totalOriginal) * 100).toFixed(1)}%`);

  // Write HTML snippets guide
  const snippetsPath = path.join(ROOT, 'dist', 'responsive-images-guide.html');
  await fs.mkdir(path.join(ROOT, 'dist'), { recursive: true });

  let snippetsHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Responsive Images - Implementation Guide</title>
  <style>
    body { font-family: system-ui; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    .image-section { margin: 2rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
    h2 { color: #FF6200; }
  </style>
</head>
<body>
  <h1>Responsive Images - Implementation Guide</h1>
  <p>Copy the HTML snippets below to replace static images in your HTML files.</p>
`;

  for (const img of stats.images) {
    snippetsHTML += `
  <div class="image-section">
    <h2>${img.name}</h2>
    <p><strong>Original:</strong> ${(img.original / 1024).toFixed(1)}KB</p>
    <pre><code>${generateHTMLSnippet(img.name, images.find(i => i.name === img.name).dir)}</code></pre>
  </div>
`;
  }

  snippetsHTML += `
</body>
</html>
`;

  await fs.writeFile(snippetsPath, snippetsHTML);
  console.log(`\n📝 HTML snippets saved to: dist/responsive-images-guide.html`);
  console.log('\n✅ Image optimization complete!\n');
}

// Run
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
