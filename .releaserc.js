// .releaserc.js
const plugins = [
  [
    "@semantic-release/commit-analyzer",
    {
      preset: "conventionalcommits",
      releaseRules: [
        { type: "feat", release: "minor" },
        { type: "fix", release: "patch" },
        { type: "perf", release: "patch" },
        { type: "docs", release: "patch" },
        { type: "refactor", release: "patch" },
        { type: "style", release: "patch" },
        { type: "build", release: "patch" },
        { breaking: true, release: "major" },
      ],
    },
  ],
  [
    "@semantic-release/release-notes-generator",
    {
      preset: "conventionalcommits",
      presetConfig: {
        types: [
          { type: "feat", section: "🚀 Features", hidden: false },
          { type: "fix", section: "🐛 Bug Fixes", hidden: false },
          {
            type: "perf",
            section: "⚡ Performance Improvements",
            hidden: false,
          },
          { type: "docs", section: "📚 Documentation", hidden: false },
          { type: "refactor", section: "♻️ Code Refactoring", hidden: false },
          { type: "style", section: "💄 Styling", hidden: false },
          { type: "test", section: "🧪 Tests", hidden: false },
          { type: "build", section: "📦 Build System", hidden: false },
          { type: "ci", section: "👷 CI/CD", hidden: false },
          { type: "chore", section: "🔧 Maintenance", hidden: false },
          { type: "revert", section: "⏪ Reverts", hidden: false },
        ],
      },
      writerOpts: {
        groupBy: "type",
        commitGroupsSort: ["feat", "fix", "perf", "refactor", "docs"],
        commitsSort: ["scope", "subject"],
      },
    },
  ],
  [
    "@semantic-release/changelog",
    {
      changelogFile: "CHANGELOG.md",
      changelogTitle:
        "# Changelog\n\nAll notable changes to Go Docs MCP Server will be documented in this file.\n",
    },
  ],
  [
    "@semantic-release/git",
    {
      assets: ["CHANGELOG.md", "package.json"],
      message:
        "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
    },
  ],
  [
    "@semantic-release/github",
    {
      successComment:
        "🎉 This ${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version ${nextRelease.version}",
      releasedLabels: ["released"],
    },
  ],
];

// Allow skipping changelog plugin when SKIP_CHANGELOG is set in the environment
const skipChangelog =
  process.env.SKIP_CHANGELOG === "true" || process.env.SKIP_CHANGELOG === "1";
const effectivePlugins = skipChangelog
  ? plugins.filter(
      (p) => !(Array.isArray(p) && p[0] === "@semantic-release/changelog")
    )
  : plugins;

export default {
  branches: ["main", "master"],
  plugins: effectivePlugins,
};
