#!/usr/bin/env node

/**
 * Critical CSS Extraction Script
 *
 * Extracts above-the-fold critical CSS for inline in <head>
 * Target: <2KB inline critical CSS
 *
 * Usage: npm run css:critical
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

/**
 * Extract critical CSS rules
 *
 * This is a simple extractor that identifies critical selectors.
 * For production, consider using the 'critical' npm package with
 * a headless browser for more accurate extraction.
 */
async function extractCriticalCSS(cssPath) {
  const css = await fs.readFile(cssPath, 'utf-8');

  // Critical selectors for above-the-fold content
  const criticalSelectors = [
    // Base/reset
    /^\*,/m,
    /^html\s*{/m,
    /^body\s*{/m,
    /^:root\s*{/m,

    // Header
    /#site-header/,
    /\.header-left/,
    /\.header-right/,
    /\.nav-card/,

    // Hero section (above the fold)
    /#hero/,
    /\.text-neon-orange/,
    /\.text-neon-green/,
    /\.contract-address/,
    /\.logo-frame/,
    /\.ph-box/,

    // Essential layout
    /\.layout-grid/,
    /\.section/,
    /\.card/,
    /\.glass/,

    // Typography
    /^h1\s*{/m,
    /^h2\s*{/m,
    /^h3\s*{/m,
    /^p\s*{/m,
    /^a\s*{/m,

    // Utility classes used in hero
    /\.muted/,
    /\.sr-only/,
    /\.grid/,
    /\.grid-2/
  ];

  // Extract rules that match critical selectors
  const criticalRules = [];
  let inCriticalRule = false;
  let currentRule = '';
  let braceDepth = 0;

  // Simple parser to extract matching rules
  const lines = css.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this line starts a critical rule
    if (!inCriticalRule) {
      const isCritical = criticalSelectors.some(pattern => pattern.test(trimmed));

      if (isCritical) {
        inCriticalRule = true;
        currentRule = line + '\n';
        braceDepth = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      }
    } else {
      currentRule += line + '\n';
      braceDepth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

      if (braceDepth === 0) {
        criticalRules.push(currentRule);
        currentRule = '';
        inCriticalRule = false;
      }
    }
  }

  return criticalRules.join('\n');
}

/**
 * Manually create critical CSS with essential rules
 */
function generateMinimalCriticalCSS() {
  return `/* Critical CSS - Inline for above-the-fold */
:root{--dark:#1a1a1a;--dark-2:#0a0a0a;--text:#eaeaea;--neon-orange:#FF6200;--neon-green:#00FF66;--glass-bg:rgba(255,255,255,.08);--glass-border:rgba(255,255,255,.18);--header-height:72px;--card-radius:16px;--section-gap:3rem}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body{font-family:system-ui,-apple-system,sans-serif;background:var(--dark);color:var(--text);line-height:1.6;min-height:100vh}
#site-header{position:sticky;top:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;background:rgba(10,10,10,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--glass-border);height:var(--header-height)}
.header-left,.header-right{display:flex;gap:.75rem}
.nav-card{padding:.5rem 1rem;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:8px;color:var(--text);text-decoration:none;font-weight:600;transition:all .2s}
.nav-card:hover{background:rgba(255,255,255,.15);border-color:var(--neon-green)}
.layout-grid{display:grid;grid-template-columns:1fr;gap:1rem;padding:1rem;max-width:1800px;margin:0 auto}
#hero{padding:2rem 0}
.text-neon-orange{color:var(--neon-orange)}
.text-neon-green{color:var(--neon-green)}
h1{font-size:clamp(2rem,3.6vw,3.2rem);font-weight:800;line-height:1.02;margin:0 0 1rem}
.contract-address{font-family:monospace;font-size:.85rem;padding:.5rem .75rem;background:rgba(255,255,255,.05);border:1px solid var(--glass-border);border-radius:6px;cursor:pointer;word-break:break-all}
.logo-frame{display:flex;justify-content:center;align-items:center}
.logo-frame__img{max-width:100%;height:auto;border-radius:12px}
.ph-box{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--card-radius);padding:1rem}
.grid{display:grid;gap:1rem}
.grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.card{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--card-radius);padding:1.25rem}
.glass{background:var(--glass-bg);backdrop-filter:blur(12px)}
.muted{opacity:.75}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:768px){#site-header{padding:.75rem 1rem}.grid-2{grid-template-columns:1fr}#hero{padding:1rem 0}}`;
}

/**
 * Main execution
 */
async function main() {
  console.log('✂️  Critical CSS Extraction\n');
  console.log('════════════════════════════════════════════════════════\n');

  // Use manually crafted critical CSS for precision
  const criticalCSS = generateMinimalCriticalCSS();

  const size = Buffer.byteLength(criticalCSS, 'utf-8');

  console.log(`📏 Critical CSS size: ${(size / 1024).toFixed(2)}KB`);

  if (size > 2048) {
    console.log(`⚠️  Warning: Critical CSS exceeds 2KB target (${(size / 1024).toFixed(2)}KB)`);
  } else {
    console.log(`✅ Critical CSS within 2KB target`);
  }

  // Write critical CSS
  const outputDir = path.join(ROOT, 'dist', 'css');
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'critical.css');
  await fs.writeFile(outputPath, criticalCSS);

  console.log(`\n📦 Output: dist/css/critical.css`);

  // Create inline version (for copy-paste into HTML <style> tag)
  const inlineVersion = `<!-- CRITICAL CSS - Inline in <head> -->
<style>
${criticalCSS}
</style>`;

  const inlinePath = path.join(outputDir, 'critical-inline.html');
  await fs.writeFile(inlinePath, inlineVersion);

  console.log(`📦 Inline version: dist/css/critical-inline.html`);

  console.log('\n💡 Usage:');
  console.log('   1. Copy content from dist/css/critical-inline.html');
  console.log('   2. Paste into <head> of your HTML files');
  console.log('   3. Load full styles.min.css with <link rel="preload"> or defer\n');

  console.log('✅ Critical CSS extraction complete!\n');
}

// Run
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
