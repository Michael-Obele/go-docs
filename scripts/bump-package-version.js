#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const argv = process.argv.slice(2);
let version = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--version" || argv[i] === "-v") version = argv[++i];
}
if (!version) {
  console.error("Usage: bump-package-version.js --version x.y.z");
  process.exit(1);
}

const pkgPath = resolve(process.cwd(), "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.version = version;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log(`Bumped package.json version to ${version}`);
