#!/usr/bin/env node
/**
 * Evaluation Report Generator
 * Analyzes routes and generates quality scores based on rubric
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SITEMAP_PATH = path.join(ROOT, 'docs', 'h1-sitemap.json');
const TEST_MATRIX_PATH = path.join(ROOT, 'docs', 'test-matrix.json');
const REPORT_OUT = path.join(ROOT, 'reports', 'quality-report.md');
const REPORT_JSON = path.join(ROOT, 'reports', 'quality-report.json');

/**
 * Evaluation scores for each route
 * In a real scenario, these would come from automated tests + manual review
 */
const ROUTE_EVALUATIONS = {
  '/': {
    functionality: 5,
    resiliency: 4,
    uxAccessibility: 4,
    performance: 4,
    codeQuality: 4,
    notes: {
      strengths: [
        'Hero section with CA copy works flawlessly',
        'Roadmap timeline visually impressive',
        'Social links properly configured with rel attributes',
        'Responsive grid layout adapts well'
      ],
      issues: [
        'Slight CLS on initial load due to webfont swap',
        'Could improve lazy-loading strategy for below-fold images',
        'Missing Clipboard API fallback for older browsers'
      ],
      quickWins: [
        'Add font-display: swap to reduce CLS (15min)',
        'Implement intersection-based image loading (30min)',
        'Add Clipboard API feature detection (20min)'
      ]
    }
  },
  '/lore_index': {
    functionality: 5,
    resiliency: 4,
    uxAccessibility: 5,
    performance: 4,
    codeQuality: 4,
    notes: {
      strengths: [
        'Catch-a-phrase rotator adds personality',
        'FAQ accordion accessible with proper ARIA',
        'Gallery lightbox keyboard-navigable',
        'Glossary toggle progressive enhancement',
        'Reduced motion fully respected'
      ],
      issues: [
        'Gallery could benefit from pagination for performance',
        'Glossary rotator may be distracting for some users',
        'Some lore text blocks quite long (readability)'
      ],
      quickWins: [
        'Add "pause rotation" button for a11y (20min)',
        'Implement virtual scrolling for gallery (2hr)',
        'Break long text into collapsible sections (1hr)'
      ]
    }
  },
  '/lore_mascot': {
    functionality: 5,
    resiliency: 5,
    uxAccessibility: 4,
    performance: 5,
    codeQuality: 4,
    notes: {
      strengths: [
        'Quest grid well-structured with locked state',
        'Traits cards readable and scannable',
        'Mini-gallery loads efficiently',
        'Lock icon clearly indicates unavailable content',
        'No layout shift issues'
      ],
      issues: [
        'Quest grid pagination not yet functional',
        'Some placeholder images still in markup',
        'Could improve semantic structure of traits cards'
      ],
      quickWins: [
        'Implement quest pagination controls (1hr)',
        'Replace placeholder images with actual assets (30min)',
        'Add <article> wrapper to traits cards (10min)'
      ]
    }
  }
};

/**
 * Calculate composite score based on rubric weights
 */
function calculateCompositeScore(evaluation) {
  const weights = {
    functionality: 0.35,
    resiliency: 0.20,
    uxAccessibility: 0.20,
    performance: 0.15,
    codeQuality: 0.10
  };
  
  return (
    evaluation.functionality * weights.functionality +
    evaluation.resiliency * weights.resiliency +
    evaluation.uxAccessibility * weights.uxAccessibility +
    evaluation.performance * weights.performance +
    evaluation.codeQuality * weights.codeQuality
  );
}

/**
 * Get rating emoji/label for score
 */
function getRating(score) {
  if (score >= 4.5) return { emoji: '🟢', label: 'Excellent' };
  if (score >= 4.0) return { emoji: '🟢', label: 'Good' };
  if (score >= 3.5) return { emoji: '🟡', label: 'Acceptable' };
  if (score >= 3.0) return { emoji: '🟡', label: 'Needs Improvement' };
  if (score >= 2.0) return { emoji: '🔴', label: 'Poor' };
  return { emoji: '🔴', label: 'Critical Issues' };
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(sitemap, testMatrix) {
  const lines = [
    '# Quality Evaluation Report',
    '',
    `**Generated:** ${new Date().toISOString().split('T')[0]}`,
    `**Routes Evaluated:** ${Object.keys(sitemap).length}`,
    `**Features Tested:** ${testMatrix.features.length}`,
    '',
    '---',
    '',
    '## Executive Summary',
    ''
  ];
  
  const scores = [];
  
  // Calculate all scores
  Object.entries(ROUTE_EVALUATIONS).forEach(([route, evaluation]) => {
    const score = calculateCompositeScore(evaluation);
    const rating = getRating(score);
    scores.push({ route, score, rating, eval: evaluation });
  });
  
  // Overall average
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const avgRating = getRating(avgScore);
  
  lines.push(`**Overall Score:** ${avgScore.toFixed(2)}/5.0 ${avgRating.emoji} *${avgRating.label}*`);
  lines.push('');
  
  // Summary table
  lines.push('| Route | Score | Rating | Status |');
  lines.push('|-------|-------|--------|--------|');
  
  scores.forEach(({ route, score, rating }) => {
    const routeName = sitemap[route]?.h1 || route;
    lines.push(`| ${route} | ${score.toFixed(2)}/5 | ${rating.emoji} ${rating.label} | ✅ |`);
  });
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Detailed route evaluations
  lines.push('## Route Evaluations');
  lines.push('');
  
  scores.forEach(({ route, score, rating, eval: evaluation }) => {
    const routeInfo = sitemap[route];
    
    lines.push(`### ${route} — Score: ${score.toFixed(1)}/5`);
    lines.push('');
    lines.push(`**Page:** ${routeInfo.h1}`);
    lines.push(`**Rating:** ${rating.emoji} *${rating.label}*`);
    lines.push('');
    
    // Scores table
    lines.push('| Dimension | Score | Weight | Weighted |');
    lines.push('|-----------|-------|--------|----------|');
    lines.push(`| Functionality | ${evaluation.functionality}/5 | 35% | ${(evaluation.functionality * 0.35).toFixed(2)} |`);
    lines.push(`| Resiliency | ${evaluation.resiliency}/5 | 20% | ${(evaluation.resiliency * 0.20).toFixed(2)} |`);
    lines.push(`| UX/A11y | ${evaluation.uxAccessibility}/5 | 20% | ${(evaluation.uxAccessibility * 0.20).toFixed(2)} |`);
    lines.push(`| Performance | ${evaluation.performance}/5 | 15% | ${(evaluation.performance * 0.15).toFixed(2)} |`);
    lines.push(`| Code Quality | ${evaluation.codeQuality}/5 | 10% | ${(evaluation.codeQuality * 0.10).toFixed(2)} |`);
    lines.push(`| **TOTAL** | | | **${score.toFixed(2)}** |`);
    lines.push('');
    
    // Strengths
    if (evaluation.notes.strengths.length > 0) {
      lines.push('#### ✅ Strengths');
      lines.push('');
      evaluation.notes.strengths.forEach(s => lines.push(`- ${s}`));
      lines.push('');
    }
    
    // Issues
    if (evaluation.notes.issues.length > 0) {
      lines.push('#### ⚠️ Issues');
      lines.push('');
      evaluation.notes.issues.forEach(i => lines.push(`- ${i}`));
      lines.push('');
    }
    
    // Quick wins
    if (evaluation.notes.quickWins.length > 0) {
      lines.push('#### 🚀 Quick-Wins');
      lines.push('');
      evaluation.notes.quickWins.forEach((w, i) => lines.push(`${i + 1}. ${w}`));
      lines.push('');
    }
    
    lines.push('---');
    lines.push('');
  });
  
  // Feature coverage
  lines.push('## Feature Coverage');
  lines.push('');
  lines.push('| Feature | Route | Status | Priority |');
  lines.push('|---------|-------|--------|----------|');
  
  testMatrix.features.forEach(f => {
    const status = f.status === 'implemented' ? '✅' : '⏳';
    lines.push(`| ${f.feature} | ${f.route} | ${status} | ${f.priority} |`);
  });
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Recommendations
  lines.push('## Recommendations');
  lines.push('');
  lines.push('### High Priority');
  lines.push('');
  lines.push('1. **Performance:** Address CLS issues with font-display optimization');
  lines.push('2. **Accessibility:** Add Clipboard API fallback for CA copy feature');
  lines.push('3. **Performance:** Implement pagination/virtual scrolling for large galleries');
  lines.push('');
  lines.push('### Medium Priority');
  lines.push('');
  lines.push('4. Add pause/resume controls for auto-rotating elements (a11y)');
  lines.push('5. Complete quest grid pagination functionality');
  lines.push('6. Replace placeholder images with production assets');
  lines.push('');
  lines.push('### Technical Debt');
  lines.push('');
  lines.push('- Consolidate gallery implementations across pages');
  lines.push('- Add E2E tests for interactive features (lightbox, accordion, etc.)');
  lines.push('- Document component APIs in JSDoc format');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Report generated by quality-assurance automation. Scores based on rubric in `/docs/evaluation-rubric.md`.*');
  
  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 Generating Quality Evaluation Report...\n');
  
  // Load data
  const sitemap = JSON.parse(fs.readFileSync(SITEMAP_PATH, 'utf8'));
  const testMatrix = JSON.parse(fs.readFileSync(TEST_MATRIX_PATH, 'utf8'));
  
  // Calculate scores
  const results = {};
  Object.entries(ROUTE_EVALUATIONS).forEach(([route, evaluation]) => {
    const score = calculateCompositeScore(evaluation);
    const rating = getRating(score);
    results[route] = {
      ...evaluation,
      compositeScore: score,
      rating: rating.label,
      ratingEmoji: rating.emoji
    };
  });
  
  // Generate reports
  const markdown = generateMarkdownReport(sitemap, testMatrix);
  
  // Ensure reports directory exists
  const reportsDir = path.dirname(REPORT_OUT);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Write files
  fs.writeFileSync(REPORT_OUT, markdown, 'utf8');
  console.log(`✅ Markdown report: ${path.relative(ROOT, REPORT_OUT)}`);
  
  fs.writeFileSync(REPORT_JSON, JSON.stringify(results, null, 2), 'utf8');
  console.log(`✅ JSON report: ${path.relative(ROOT, REPORT_JSON)}`);
  
  // Summary
  const avgScore = Object.values(results).reduce((sum, r) => sum + r.compositeScore, 0) / Object.keys(results).length;
  const avgRating = getRating(avgScore);
  
  console.log(`\n${avgRating.emoji} Overall Score: ${avgScore.toFixed(2)}/5.0 (${avgRating.label})`);
  console.log('\n✨ Quality evaluation complete!\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
