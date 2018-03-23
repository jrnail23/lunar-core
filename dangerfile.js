/* eslint-disable no-undef */
// Danger file requires that you use certain globals (danger, warn, fail etc).
// see: https://github.com/danger/danger-js/blob/3c54f9fbdcfbf5c93dcf3eff48d594682f3b4f2c/source/danger.ts
const {existsSync, lstatSync} = require('fs');

// Setup
const {pr} = danger.github;
const {modified_files: modified} = danger.git;

const javascriptOnly = file => file.includes('.js');
const filesOnly = file => existsSync(file) && lstatSync(file).isFile();

// Custom subsets of known files
const modifiedAppFiles = modified
  .filter(p => p.includes('src/') || p.includes('test/'))
  .filter(p => filesOnly(p) && javascriptOnly(p));

// No PR is too small to warrant a paragraph or two of summary
if (pr.body.length === 0) {
  warn('Please add a description to your PR.');
}

const hasAppChanges = modifiedAppFiles.length > 0;
const testChanges = modifiedAppFiles.filter(filepath => filepath.includes('test'));
const storyChanges = modifiedAppFiles.filter(filepath => filepath.includes('stories'));
const hasTestChanges = testChanges.length > 0;

// Warn when there is a big PR
const bigPRThreshold = 500;
if (pr.additions - pr.deletions > bigPRThreshold) {
  fail('Big PR. PRs should be small and focused on doing one thing.');
}

// Warn if there are library changes, but not tests
if (hasAppChanges && !hasTestChanges) {
  warn(
    `There are library changes, but not tests. That's OK as long as you're refactoring existing code`
  );
}

// Warn if there are library changes, but not updated stories
if (hasAppChanges && !storyChanges) {
  warn(
    `There are library changes, but no stories have been updated. You may wish to verify whether your changes are covered by an existing story.`
  );
}
