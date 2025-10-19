#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const htmlFiles = [
  'index.html',
  'lore_index.html',
  'lore_mascot.html'
];

const requiredSelectors = {
  'index.html': {
    required: [
      '#site-header',
      '#hero',
      '#intro',
      '#roadmap',
      '#tools',
      '#social-pyramid',
      '#site-footer'
    ],
    optional: ['#gallery']
  },
  'lore_index.html': {
    required: [
      '#site-header',
      '.layout-grid',
      '.layout-grid aside.left-rail#left-rail',
      '.layout-grid main#site-main',
      'main#site-main #thesis',
      'main#site-main #catch-phrase',
      'main#site-main #glossary',
      'main#site-main #lore-gallery',
      'main#site-main #faq',
      '#site-footer'
    ],
    optional: []
  },
  'lore_mascot.html': {
    required: [
      '#site-header',
      '.layout-grid',
      '.layout-grid main#site-main',
      'main#site-main #mascot-intro',
      'main#site-main #mascot-cards',
      'main#site-main #mascot-gallery',
      'main#site-main #mascot-questgrid',
      '#site-footer'
    ],
    optional: [
      '.layout-grid aside.left-rail#left-rail'
    ]
  }
};

const germanTokens = [
  'und',
  'oder',
  'zur',
  'zum',
  'zurück',
  'weiter',
  'seite',
  'bitte',
  'danke',
  'hallo',
  'willkommen',
  'abschließen',
  'erledigt',
  'abbrechen',
  'schließen',
  'öffnen',
  'klicken',
  'drücken',
  'lesen',
  'frage',
  'antwort',
  'mehr',
  'weniger',
  'zurückkehren',
  'übersicht'
];

const germanWordRegex = new RegExp(
  germanTokens
    .map((w) => w.trim())
    .filter(Boolean)
    .map((w) => `(?:^|\\b)${w.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?:$|\\b)`)
    .join('|'),
  'i'
);

const germanCharRegex = /[äöüÄÖÜß]/;
const attributeKeys = ['aria-label', 'title', 'alt', 'aria-describedby', 'aria-labelledby', 'placeholder'];

const selfClosingTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

function parseAttributes(raw) {
  const attrs = {};
  const attrRegex = /([^\s=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'`]+)))?/g;
  let match;
  while ((match = attrRegex.exec(raw))) {
    const name = match[1];
    const value = match[3] ?? match[4] ?? match[5] ?? '';
    attrs[name] = value;
  }
  return attrs;
}

function parseHTML(source) {
  const root = { tag: '#document', attrs: {}, children: [], parent: null };
  const stack = [root];
  const tagRegex = /<[^>]+>|[^<]+/g;
  let match;

  while ((match = tagRegex.exec(source))) {
    const token = match[0];
    if (token.startsWith('<')) {
      if (/^<\//.test(token)) {
        const tagName = token.slice(2, -1).trim().toLowerCase();
        for (let i = stack.length - 1; i >= 0; i -= 1) {
          if (stack[i].tag === tagName) {
            stack.length = i;
            break;
          }
        }
        continue;
      }

      const isSelfClosing = /\/>$/.test(token);
      const tagMatch = /^<([a-zA-Z0-9:-]+)/.exec(token);
      if (!tagMatch) {
        continue;
      }
      const tagName = tagMatch[1].toLowerCase();
      const attrMatch = /<[^\s>]+\s*([^>]*)>/.exec(token);
      const rawAttrs = attrMatch ? attrMatch[1] : '';
      const attrs = parseAttributes(rawAttrs);

      const node = {
        tag: tagName,
        attrs,
        children: [],
        parent: stack[stack.length - 1]
      };
      stack[stack.length - 1].children.push(node);

      if (!(isSelfClosing || selfClosingTags.has(tagName))) {
        stack.push(node);
      }
    } else {
      const text = token;
      const parent = stack[stack.length - 1];
      if (parent) {
        parent.children.push({
          tag: '#text',
          text,
          parent
        });
      }
    }
  }
  return root;
}

function getAttribute(node, name) {
  if (!node.attrs) return undefined;
  return node.attrs[name];
}

function getClasses(node) {
  const classAttr = getAttribute(node, 'class');
  return classAttr ? classAttr.split(/\s+/).filter(Boolean) : [];
}

function matchesSimpleSelector(node, selector) {
  if (!node || node.tag === '#text') return false;
  const parsed = { tag: null, id: null, classes: [] };
  let buffer = selector;

  const tagMatch = buffer.match(/^[a-z0-9-]+/i);
  if (tagMatch) {
    parsed.tag = tagMatch[0].toLowerCase();
    buffer = buffer.slice(tagMatch[0].length);
  }
  const idMatch = buffer.match(/#[a-zA-Z0-9_-]+/);
  if (idMatch) {
    parsed.id = idMatch[0].slice(1);
    buffer = buffer.replace(idMatch[0], '');
  }
  const classMatches = buffer.match(/\.[a-zA-Z0-9_-]+/g);
  if (classMatches) {
    parsed.classes = classMatches.map((cls) => cls.slice(1));
  }

  if (parsed.tag && node.tag !== parsed.tag) return false;
  if (parsed.id && getAttribute(node, 'id') !== parsed.id) return false;

  const classes = getClasses(node);
  return parsed.classes.every((cls) => classes.includes(cls));
}

function querySelectorAll(node, selector) {
  const parts = selector.trim().split(/\s+/);
  const results = [];

  function traverse(current) {
    if (!current || current.tag === '#text') return;
    if (matchesSimpleSelector(current, parts[parts.length - 1])) {
      let ancestor = current;
      let match = true;
      for (let i = parts.length - 2; i >= 0; i -= 1) {
        let candidate = ancestor.parent;
        while (candidate && candidate.tag === '#text') {
          candidate = candidate.parent;
        }
        let found = false;
        while (candidate) {
          if (matchesSimpleSelector(candidate, parts[i])) {
            ancestor = candidate;
            found = true;
            break;
          }
          candidate = candidate.parent;
        }
        if (!found) {
          match = false;
          break;
        }
      }
      if (match) {
        results.push(current);
      }
    }
    for (const child of current.children || []) {
      traverse(child);
    }
  }

  traverse(node);
  return results;
}

function querySelector(node, selector) {
  const matches = querySelectorAll(node, selector);
  return matches[0] ?? null;
}

function getTextContent(node) {
  if (!node) return '';
  if (node.tag === '#text') return node.text ?? '';
  return (node.children || []).map((child) => getTextContent(child)).join('');
}

function buildNodePath(node) {
  const parts = [];
  let current = node;
  while (current && current.parent) {
    if (current.tag === '#text') {
      parts.push('#text');
    } else {
      const id = getAttribute(current, 'id');
      const classes = getClasses(current);
      let descriptor = current.tag;
      if (id) descriptor += `#${id}`;
      if (classes.length) descriptor += `.${classes.join('.')}`;
      const siblings = current.parent.children.filter((child) => child.tag === current.tag);
      if (siblings.length > 1) {
        const index = siblings.indexOf(current);
        descriptor += `:nth-of-type(${index + 1})`;
      }
      parts.push(descriptor);
    }
    current = current.parent;
  }
  return parts.reverse().join(' > ');
}

function detectGerman(text) {
  if (!text) return false;
  if (germanCharRegex.test(text)) return true;
  return germanWordRegex.test(text.toLowerCase());
}

function collectIssuesForFile(file, documentRoot) {
  const { required, optional } = requiredSelectors[file] ?? { required: [], optional: [] };
  const issues = [];
  const warnings = [];

  for (const selector of required) {
    if (!querySelector(documentRoot, selector)) {
      issues.push({ type: 'missing-selector', selector });
    }
  }

  for (const selector of optional) {
    if (!querySelector(documentRoot, selector)) {
      warnings.push({ type: 'optional-missing', selector });
    }
  }

  if (file === 'lore_index.html') {
    const rightRail = querySelector(documentRoot, '.layout-grid .right-rail');
    if (rightRail) {
      issues.push({ type: 'unexpected-right-rail', path: buildNodePath(rightRail) });
    }
  }

  const idMap = new Map();
  const headings = [];
  const textEntries = [];

  function walk(node) {
    if (!node) return;
    if (node.tag !== '#text') {
      const id = getAttribute(node, 'id');
      if (id) {
        const collection = idMap.get(id) ?? [];
        collection.push(node);
        idMap.set(id, collection);
      }

      if (['h1', 'h2', 'h3'].includes(node.tag)) {
        const text = getTextContent(node).trim();
        headings.push({ node, text });
      }

      const ownText = (node.children || [])
        .filter((child) => child.tag === '#text')
        .map((child) => child.text)
        .join('')
        .trim();
      if (ownText) {
        textEntries.push({ node, text: ownText, source: 'text' });
      }

      for (const attr of attributeKeys) {
        const value = getAttribute(node, attr);
        if (value) {
          textEntries.push({ node, text: value, attribute: attr, source: 'attribute' });
        }
      }
    }

    for (const child of node.children || []) {
      walk(child);
    }
  }

  walk(documentRoot);

  for (const [id, nodes] of idMap.entries()) {
    if (nodes.length > 1) {
      issues.push({
        type: 'duplicate-id',
        id,
        occurrences: nodes.map((node) => buildNodePath(node))
      });
    }
  }

  for (const heading of headings) {
    if (!heading.text) {
      issues.push({ type: 'empty-heading', path: buildNodePath(heading.node) });
    }
  }

  const nonEnglish = [];
  for (const entry of textEntries) {
    if (detectGerman(entry.text)) {
      nonEnglish.push({
        text: entry.text,
        path: buildNodePath(entry.node) + (entry.attribute ? `[@${entry.attribute}]` : ''),
        source: entry.source
      });
    }
  }

  return { issues, warnings, nonEnglish };
}

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    files: {},
    summary: {
      totalIssues: 0,
      totalWarnings: 0,
      totalNonEnglish: 0
    }
  };

  let hasIssues = false;

  for (const file of htmlFiles) {
    const absolutePath = path.resolve(projectRoot, file);
    const content = await fs.readFile(absolutePath, 'utf8');
    const documentRoot = parseHTML(content);
    const result = collectIssuesForFile(file, documentRoot);
    report.files[file] = result;
    report.summary.totalIssues += result.issues.length;
    report.summary.totalWarnings += result.warnings.length;
    report.summary.totalNonEnglish += result.nonEnglish.length;
    if (result.issues.length > 0 || result.nonEnglish.length > 0) {
      hasIssues = true;
    }
  }

  const reportDir = path.resolve(projectRoot, 'reports');
  await fs.mkdir(reportDir, { recursive: true });

  const jsonPath = path.join(reportDir, 'sitemap_audit.json');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const mdLines = [
    '# Sitemap Audit Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `* Total issues: ${report.summary.totalIssues}`,
    `* Total warnings: ${report.summary.totalWarnings}`,
    `* Non-English strings: ${report.summary.totalNonEnglish}`,
    ''
  ];

  for (const file of htmlFiles) {
    const data = report.files[file];
    mdLines.push(`## ${file}`);
    mdLines.push('');
    if (data.issues.length === 0 && data.nonEnglish.length === 0) {
      mdLines.push('- No blocking issues found.');
    }
    if (data.issues.length > 0) {
      mdLines.push('- Issues:');
      for (const issue of data.issues) {
        if (issue.type === 'missing-selector') {
          mdLines.push(`  - Missing selector: \`${issue.selector}\``);
        } else if (issue.type === 'unexpected-right-rail') {
          mdLines.push(`  - Unexpected right rail at \`${issue.path}\``);
        } else if (issue.type === 'duplicate-id') {
          mdLines.push(`  - Duplicate id \`${issue.id}\` at ${issue.occurrences.map((loc) => `\`${loc}\``).join(', ')}`);
        } else if (issue.type === 'empty-heading') {
          mdLines.push(`  - Empty heading at \`${issue.path}\``);
        }
      }
    }
    if (data.warnings.length > 0) {
      mdLines.push('- Warnings:');
      for (const warning of data.warnings) {
        if (warning.type === 'optional-missing') {
          mdLines.push(`  - Optional selector missing: \`${warning.selector}\``);
        }
      }
    }
    if (data.nonEnglish.length > 0) {
      mdLines.push('- Non-English strings:');
      for (const entry of data.nonEnglish) {
        mdLines.push(`  - \`${entry.text}\` at \`${entry.path}\``);
      }
    }
    mdLines.push('');
  }

  const mdPath = path.join(reportDir, 'sitemap_audit.md');
  await fs.writeFile(mdPath, mdLines.join('\n'), 'utf8');

  if (hasIssues) {
    console.error('Sitemap audit found issues. See reports for details.');
    process.exitCode = 1;
  } else {
    console.log('Sitemap audit passed. Reports generated.');
  }
}

main().catch((error) => {
  console.error('Failed to run sitemap audit:', error);
  process.exitCode = 1;
});
