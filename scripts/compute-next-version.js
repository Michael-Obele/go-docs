#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

function gitLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0').toString().trim();
  } catch (e) {
    // No tags
    return null;
  }
}

function gitCommitsSince(tag) {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const out = execSync(`git log --pretty=format:%s||%b ${range}`); // subject||body
  return out.toString('utf8').split('\n').filter(Boolean).map((s) => s.trim());
}

function getHighestReleaseLevel(commits) {
  // 3=major, 2=minor, 1=patch, 0=none
  let level = 0;
  for (const commit of commits) {
    const subject = commit.split('||')[0] || '';
    const body = commit.split('||')[1] || '';
    const breaking = subject.includes('!') || body.includes('BREAKING CHANGE');
    if (breaking) return 3; // highest
    const typeMatch = subject.match(/^([a-zA-Z]+)(?:\([\w\-\s]+\))?:/);
    if (!typeMatch) continue;
    const type = typeMatch[1];
    if (type === 'feat') level = Math.max(level, 2);
    else if (['fix', 'perf', 'refactor', 'docs', 'style', 'build', 'ci', 'chore', 'test'].includes(type)) {
      level = Math.max(level, 1);
    }
  }
  return level;
}

function bumpVersion(oldVersion, level) {
  const semver = oldVersion ? oldVersion.replace(/^v/, '').split('.') : ['0', '0', '0'];
  let [major, minor, patch] = semver.map((s) => parseInt(s, 10));
  if (level === 3) {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (level === 2) {
    minor += 1;
    patch = 0;
  } else if (level === 1) {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function main() {
  const currentTag = gitLatestTag();
  const commits = gitCommitsSince(currentTag);
  const level = getHighestReleaseLevel(commits);
  if (level === 0) {
    console.log('none');
    return;
  }
  const oldVersion = currentTag || JSON.parse(fs.readFileSync('package.json', 'utf8')).version || '0.0.0';
  const newVersion = bumpVersion(oldVersion, level);
  console.log(newVersion);
}

main();
