// commitlint.config.js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [0, "always"],
    "footer-max-line-length": [0, "always"],
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting
        "refactor", // Code refactoring
        "perf", // Performance
        "test", // Tests
        "chore", // Maintenance
        "ci", // CI/CD
        "revert", // Revert commits
      ],
    ],
  },
};
