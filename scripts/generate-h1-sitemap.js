#!/usr/bin/env node
/**
 * H1 Sitemap Generator
 * Scans HTML files and extracts H1 titles + H2 sections for documentation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const OUT_JSON = path.join(ROOT, 'docs', 'h1-sitemap.json');
const OUT_MD = path.join(ROOT, 'docs', 'h1-sitemap.md');

/**
 * HTML files to scan (relative to workspace root)
 */
const HTML_FILES = [
  'index.html',
  'lore_index.html',
  'lore_mascot.html'
];

/**
 * Extract H1 from HTML content
 * @param {string} html - HTML content
 * @returns {string|null}
 */
function extractH1(html) {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) return null;
  
  // Strip HTML tags and decode entities
  let text = h1Match[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  
  return text || null;
}

/**
 * Extract H2 sections from HTML content
 * @param {string} html - HTML content
 * @returns {string[]}
 */
function extractH2Sections(html) {
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const sections = [];
  let match;
  
  while ((match = h2Regex.exec(html)) !== null) {
    let text = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    if (text && !sections.includes(text)) {
      sections.push(text);
    }
  }
  
  return sections;
}

/**
 * Derive route from filename
 * @param {string} filename
 * @returns {string}
 */
function deriveRoute(filename) {
  if (filename === 'index.html') return '/';
  return '/' + filename.replace('.html', '');
}

/**
 * Generate sitemap from HTML files
 */
async function generateSitemap() {
  const sitemap = {};
  
  for (const file of HTML_FILES) {
    const filePath = path.join(ROOT, file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }
    
    const html = fs.readFileSync(filePath, 'utf8');
    const route = deriveRoute(file);
    const h1 = extractH1(html) || `Page: ${file}`;
    const sections = extractH2Sections(html);
    
    sitemap[route] = {
      h1,
      sections,
      file
    };
    
    console.log(`✓ Processed: ${route} → "${h1}" (${sections.length} sections)`);
  }
  
  return sitemap;
}

/**
 * Convert sitemap to Markdown format
 * @param {Object} sitemap
 * @returns {string}
 */
function toMarkdown(sitemap) {
  const lines = [
    '# H1 Sitemap',
    '',
    'Auto-generated sitemap showing page titles and sections.',
    '',
    '---',
    ''
  ];
  
  const sortedRoutes = Object.keys(sitemap).sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });
  
  sortedRoutes.forEach(route => {
    const { h1, sections, file } = sitemap[route];
    
    lines.push(`## ${route}`);
    lines.push('');
    lines.push(`**H1:** ${h1}`);
    lines.push('');
    lines.push(`**File:** \`${file}\``);
    lines.push('');
    lines.push('**Sections:**');
    lines.push('');
    
    if (sections.length === 0) {
      lines.push('- *(No H2 sections)*');
    } else {
      sections.forEach(section => {
        lines.push(`- ${section}`);
      });
    }
    
    lines.push('');
    lines.push('---');
    lines.push('');
  });
  
  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Generating H1 Sitemap...\n');
  
  const sitemap = await generateSitemap();
  
  // Ensure docs directory exists
  const docsDir = path.dirname(OUT_JSON);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Write JSON
  fs.writeFileSync(OUT_JSON, JSON.stringify(sitemap, null, 2), 'utf8');
  console.log(`\n✅ JSON written: ${path.relative(ROOT, OUT_JSON)}`);
  
  // Write Markdown
  const markdown = toMarkdown(sitemap);
  fs.writeFileSync(OUT_MD, markdown, 'utf8');
  console.log(`✅ Markdown written: ${path.relative(ROOT, OUT_MD)}`);
  
  console.log('\n✨ H1 Sitemap generation complete!\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
