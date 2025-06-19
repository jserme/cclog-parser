import { parseChangelog } from './dist/index.js';

// Example usage
const changelog = `
<a name="2.1.0"></a>
# 2.1.0 (2023-12-01)

### Bug Fixes

* fix critical parsing issue ([abc123](https://github.com/user/repo/commit/abc123))
* improve error handling ([def456](https://github.com/user/repo/commit/def456))

### Features

* add TypeScript support ([ghi789](https://github.com/user/repo/commit/ghi789))
* support ES modules ([jkl012](https://github.com/user/repo/commit/jkl012))

### BREAKING CHANGES

* minimum Node.js version is now 16.0.0

<a name="2.0.0"></a>
# 2.0.0 (2023-11-01)

### Features

* modernize codebase ([mno345](https://github.com/user/repo/commit/mno345))
`;

const result = parseChangelog(changelog);

console.log('📦 cclog-parser Modern Example');
console.log('==============================\n');

console.log('📋 Versions found:');
result.versions.forEach((version, index) => {
  console.log(`  ${index + 1}. ${version}`);
});

console.log('\n🔍 Changes by version:');
Object.entries(result.changes).forEach(([version, changes]) => {
  console.log(`\n📌 Version ${version}:`);
  
  if (changes.features.length > 0) {
    console.log('  ✨ Features:');
    changes.features.forEach(feature => console.log(`    • ${feature}`));
  }
  
  if (changes.fixes.length > 0) {
    console.log('  🐛 Bug Fixes:');
    changes.fixes.forEach(fix => console.log(`    • ${fix}`));
  }
  
  if (changes.breakingChanges.length > 0) {
    console.log('  💥 Breaking Changes:');
    changes.breakingChanges.forEach(change => console.log(`    • ${change}`));
  }
});

console.log('\n🎯 Parse with options:');
const resultNoDetails = parseChangelog(changelog, { includeDetails: false });
console.log('Without details - versions:', resultNoDetails.versions.length);
