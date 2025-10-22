#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function loadReport(reportPath) {
  const raw = await fs.readFile(reportPath, 'utf8');
  return JSON.parse(raw);
}

function buildEntries(report) {
  const entries = [];
  const seen = new Set();
  const files = Object.keys(report.files || {}).sort();

  for (const file of files) {
    const fileData = report.files[file];
    if (!fileData) continue;
    const list = fileData.nonEnglish || [];
    for (const item of list) {
      const key = `${file}::${item.path}::${item.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        source: item.text,
        path: `${file}::${item.path}`,
        translation: ''
      });
    }
  }

  return entries;
}

async function main() {
  const reportPath = path.join(projectRoot, 'reports', 'sitemap_audit.json');
  let report;
  try {
    report = await loadReport(reportPath);
  } catch (error) {
    console.error(`Failed to read report at ${reportPath}:`, error.message);
    process.exitCode = 1;
    return;
  }

  const entries = buildEntries(report);
  const outputPath = path.join(projectRoot, 'i18n', 'de-terms.json');
  await fs.writeFile(outputPath, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`Wrote ${entries.length} terms to ${outputPath}`);
}

main().catch((error) => {
  console.error('Failed to generate i18n term inventory:', error);
  process.exitCode = 1;
});
