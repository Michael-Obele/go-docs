#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const file = path.resolve(process.cwd(), 'CHANGELOG.md');
if (!fs.existsSync(file)) {
  console.error('CHANGELOG.md does not exist');
  process.exit(2);
}
const content = fs.readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/).filter(Boolean);
// Verify first non-empty line is the canonical header
const firstLine = lines[0] || '';
const expectedHeader = '# Changelog';
if (!firstLine.startsWith(expectedHeader)) {
  console.error(`First line is not '${expectedHeader}', found: '${firstLine}'`);
  process.exit(1);
}
// Ensure there is only one top-level header instance
const headerCount = (content.match(/^[#]{1}\s*Changelog/mg) || []).length;
if (headerCount > 1) {
  console.error(`Found ${headerCount} '# Changelog' headers — expected 1`);
  process.exit(1);
}
console.log('CHANGELOG.md header verification passed');
process.exit(0);
