#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve, basename } from "path";
import { execSync } from "child_process";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--version" || a === "-v") args.version = argv[++i];
    else if (a === "--date" || a === "-d") args.date = argv[++i];
    else if (a === "--notes" || a === "-n") args.notes = argv[++i];
    else if (a === "--file" || a === "-f") args.file = argv[++i];
    else if (a === "--write" || a === "--commit") args.write = true;
    else if (a === "--dry") args.dry = true;
      else if (a === "--commit") args.commit = true;
      else if (a === "--push") args.push = true;
      else if (a === "--tag") args.tag = true;
  }
  return args;
}

function ensureChangelogTitle(content, title) {
  let normalized = content.replace(/^#\s*Changelog.*$/gim, "");
  normalized = normalized.replace(
    /All notable changes to .* will be documented in this file\./gim,
    ""
  );
  return title + "\n" + normalized.trimStart();
}

function buildReleaseBlock(version, date, notes) {
  const trimmed = notes.trim();
  // If it's already formatted with headings (conventional-changelog style), insert as-is
  if (/^#{1,3}\s+/m.test(trimmed)) {
    // Remove top-level '## [Unreleased]' if present
    const cleaned = trimmed.replace(/^##\s*\[?Unreleased\]?[^\n]*\n+/i, "");
    return `## [${version}] - ${date}\n\n${cleaned.trim()}\n\n`;
  }
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => (l.startsWith("- ") || l.startsWith("* ") ? l : `- ${l}`));
  return `## [${version}] - ${date}\n\n${lines.join("\n")}\n\n`;
}

(async function () {
  const args = parseArgs(process.argv);
  const version = args.version || "UNRELEASED";
  const date = args.date || new Date().toISOString().slice(0, 10);
  let notes = "";
  if (args.file)
    notes = readFileSync(resolve(process.cwd(), args.file), "utf8");
  else if (args.notes) notes = args.notes;
  else notes = "- DESCRIPTION_PLACEHOLDER";

  const changelogPath = resolve(process.cwd(), "CHANGELOG.md");
  if (!existsSync(changelogPath)) {
    console.error("CHANGELOG.md not found in the repo root.");
    process.exit(1);
  }

  const changelogTitle =
    "# Changelog\n\nAll notable changes to Go Docs MCP Server will be documented in this file.";
  const orig = readFileSync(changelogPath, "utf8");
  let updated = ensureChangelogTitle(orig, changelogTitle);
  const releaseBlock = buildReleaseBlock(version, date, notes);
  const idx = updated.indexOf(changelogTitle) + changelogTitle.length;
  const afterTitle = updated.slice(idx).trimStart();
  updated = `${changelogTitle}\n\n${releaseBlock}${afterTitle}`;

  if (args.write) {
    const oldContent = readFileSync(changelogPath, 'utf8');
    if (oldContent === updated) {
      console.log('No changes to CHANGELOG.md');
    } else {
      writeFileSync(changelogPath, updated, "utf8");
      console.log(
        `Wrote updated ${basename(changelogPath)} with new entry for ${version}.`
      );
      if (args.commit) {
        try {
          execSync(`git add ${changelogPath}`);
          execSync(`git commit -m "docs(changelog): ${version} [skip ci]" --no-verify`);
          console.log('Committed CHANGELOG.md');
        } catch (e) {
          console.warn('git commit failed:', e.message);
        }
      }
      if (args.tag) {
        try {
          execSync(`git tag v${version}`);
          console.log(`Tagged v${version}`);
        } catch (e) {
          console.warn('git tag failed:', e.message);
        }
      }
      if (args.push) {
        try {
          execSync('git push');
          if (args.tag) execSync('git push --tags');
          console.log('Pushed changes');
        } catch (e) {
          console.warn('git push failed:', e.message);
        }
      }
    }
  } else {
    console.log("==== PREVIEW: Top of CHANGELOG.md after injection ====");
    console.log(updated.split(/\r?\n/).slice(0, 60).join("\n"));
  }
})();
