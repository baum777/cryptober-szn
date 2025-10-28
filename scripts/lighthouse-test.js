#!/usr/bin/env node

/**
 * Lighthouse Performance Testing Script
 *
 * Runs Lighthouse audits with mobile emulation (slow 4G, mid-tier device)
 *
 * Targets:
 * - Performance: >90
 * - Accessibility: >95
 * - SEO: >90
 * - LCP: <2.5s
 * - CLS: <0.1
 * - TTI: <3s
 *
 * Usage: npm run perf:test
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Lighthouse configuration
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    // Mobile emulation (slow 4G, mid-tier device)
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1.6 * 1024,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1.6 * 1024,
      uploadThroughputKbps: 750,
      cpuSlowdownMultiplier: 4
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',

    // Run all categories
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],

    // Output options
    output: ['html', 'json']
  }
};

// Target thresholds
const THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  seo: 90,
  lcp: 2500,  // ms
  cls: 0.1,
  tti: 3000,  // ms
  fcp: 1800   // ms
};

// URLs to test
const URLS = [
  { name: 'Home', url: 'http://localhost:8000/index.html' },
  { name: 'Lore Index', url: 'http://localhost:8000/lore_index.html' },
  { name: 'Mascot', url: 'http://localhost:8000/lore_mascot.html' }
];

/**
 * Run Lighthouse audit for a URL
 */
async function runLighthouse(url, chrome) {
  console.log(`\n🔍 Auditing: ${url.name}`);
  console.log(`   URL: ${url.url}\n`);

  try {
    const runnerResult = await lighthouse(url.url, {
      port: chrome.port,
      output: ['html', 'json'],
      logLevel: 'error'
    }, LIGHTHOUSE_CONFIG);

    return {
      name: url.name,
      url: url.url,
      lhr: runnerResult.lhr,
      report: runnerResult.report
    };

  } catch (err) {
    console.error(`   ✗ Failed to audit ${url.name}: ${err.message}`);
    return null;
  }
}

/**
 * Analyze Lighthouse results
 */
function analyzeResults(result) {
  const { lhr } = result;

  // Category scores
  const performance = Math.round(lhr.categories.performance.score * 100);
  const accessibility = Math.round(lhr.categories.accessibility.score * 100);
  const seo = Math.round(lhr.categories.seo.score * 100);
  const bestPractices = Math.round(lhr.categories['best-practices'].score * 100);

  // Core Web Vitals
  const lcp = lhr.audits['largest-contentful-paint'].numericValue;
  const cls = lhr.audits['cumulative-layout-shift'].numericValue;
  const tti = lhr.audits['interactive'].numericValue;
  const fcp = lhr.audits['first-contentful-paint'].numericValue;
  const tbt = lhr.audits['total-blocking-time'].numericValue;
  const si = lhr.audits['speed-index'].numericValue;

  // Check thresholds
  const pass = {
    performance: performance >= THRESHOLDS.performance,
    accessibility: accessibility >= THRESHOLDS.accessibility,
    seo: seo >= THRESHOLDS.seo,
    lcp: lcp <= THRESHOLDS.lcp,
    cls: cls <= THRESHOLDS.cls,
    tti: tti <= THRESHOLDS.tti
  };

  const allPassed = Object.values(pass).every(v => v);

  return {
    scores: { performance, accessibility, seo, bestPractices },
    vitals: { lcp, cls, tti, fcp, tbt, si },
    pass,
    allPassed
  };
}

/**
 * Print results
 */
function printResults(name, analysis) {
  const { scores, vitals, pass, allPassed } = analysis;

  console.log(`\n📊 Results for ${name}:`);
  console.log(`${'─'.repeat(60)}`);

  // Category scores
  console.log('\n🏆 Lighthouse Scores:');
  console.log(`   Performance:     ${scores.performance.toString().padStart(3)} ${pass.performance ? '✓' : '✗'} (target: ≥${THRESHOLDS.performance})`);
  console.log(`   Accessibility:   ${scores.accessibility.toString().padStart(3)} ${pass.accessibility ? '✓' : '✗'} (target: ≥${THRESHOLDS.accessibility})`);
  console.log(`   SEO:             ${scores.seo.toString().padStart(3)} ${pass.seo ? '✓' : '✗'} (target: ≥${THRESHOLDS.seo})`);
  console.log(`   Best Practices:  ${scores.bestPractices.toString().padStart(3)}`);

  // Core Web Vitals
  console.log('\n⚡ Core Web Vitals:');
  console.log(`   LCP:  ${(vitals.lcp / 1000).toFixed(2)}s ${pass.lcp ? '✓' : '✗'} (target: <${THRESHOLDS.lcp / 1000}s)`);
  console.log(`   CLS:  ${vitals.cls.toFixed(3)} ${pass.cls ? '✓' : '✗'} (target: <${THRESHOLDS.cls})`);
  console.log(`   TTI:  ${(vitals.tti / 1000).toFixed(2)}s ${pass.tti ? '✓' : '✗'} (target: <${THRESHOLDS.tti / 1000}s)`);
  console.log(`   FCP:  ${(vitals.fcp / 1000).toFixed(2)}s`);
  console.log(`   TBT:  ${vitals.tbt.toFixed(0)}ms`);
  console.log(`   SI:   ${(vitals.si / 1000).toFixed(2)}s`);

  console.log(`\n${allPassed ? '✅' : '⚠️'}  Overall: ${allPassed ? 'PASS' : 'NEEDS IMPROVEMENT'}`);
}

/**
 * Save reports
 */
async function saveReports(results) {
  const reportsDir = path.join(ROOT, 'reports', 'lighthouse');
  await fs.mkdir(reportsDir, { recursive: true });

  for (const result of results) {
    if (!result) continue;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeName = result.name.toLowerCase().replace(/\s+/g, '-');

    // Save HTML report
    const htmlPath = path.join(reportsDir, `${safeName}-${timestamp}.html`);
    await fs.writeFile(htmlPath, result.report[0]);

    // Save JSON report
    const jsonPath = path.join(reportsDir, `${safeName}-${timestamp}.json`);
    await fs.writeFile(jsonPath, result.report[1]);

    console.log(`\n📄 Report saved: reports/lighthouse/${safeName}-${timestamp}.html`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Lighthouse Performance Audit\n');
  console.log('════════════════════════════════════════════════════════\n');
  console.log('📱 Device: Mobile (375x667, 4x CPU slowdown)');
  console.log('🌐 Network: Slow 4G (1.6Mbps down, 750Kbps up, 150ms RTT)\n');
  console.log('⚠️  NOTE: Make sure to run a local server first:');
  console.log('   Example: python3 -m http.server 8000\n');

  // Check if server is running
  try {
    const response = await fetch('http://localhost:8000');
    if (!response.ok) throw new Error('Server not responding');
  } catch (err) {
    console.error('❌ Local server not detected at http://localhost:8000');
    console.error('   Please start a local server and try again.');
    console.error('   Example: python3 -m http.server 8000\n');
    process.exit(1);
  }

  // Launch Chrome
  console.log('🚀 Launching Chrome...\n');
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });

  try {
    const results = [];

    // Run audits
    for (const url of URLS) {
      const result = await runLighthouse(url, chrome);
      if (result) {
        results.push(result);
        const analysis = analyzeResults(result);
        printResults(result.name, analysis);
      }
    }

    // Save reports
    await saveReports(results);

    console.log('\n════════════════════════════════════════════════════════');
    console.log('✅ Lighthouse audit complete!\n');

  } finally {
    await chrome.kill();
  }
}

// Run
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
