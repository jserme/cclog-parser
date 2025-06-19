# cclog-parser

[![npm][npm-img]][npm-url] [![build][build-img]][build-url] [![coverage][coverage-img]][coverage-url] [![downloads][downloads-img]][npm-url]

Modern conventional-changelog parser with TypeScript support and ES modules.

Parse changelog files in the format used by tools like [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog), similar to the [Karma project changelog](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md).

**This package is currently maintained by AI.**

## Features

- 🎯 **TypeScript support** - Full type definitions included
- 📦 **ES Modules** - Modern module system with CommonJS compatibility
- 🔧 **Flexible parsing** - Support for multiple changelog formats
- 🚀 **Modern tooling** - Built with latest Node.js best practices
- ✅ **Well tested** - Comprehensive test coverage

## Quick Start

```bash
# Install the package
npm install cclog-parser

# Create a simple example
echo "
import { parseChangelog } from 'cclog-parser';

const changelog = \`
<a name=\"1.0.0\"></a>
# 1.0.0 (2023-01-01)

### Bug Fixes
* fix something important

### Features
* add amazing new feature
\`;

const result = parseChangelog(changelog);
console.log(result);
" > example.js

# Run it
node example.js
```

## Usage

### ES Modules (Recommended)

```typescript
import { parseChangelog } from 'cclog-parser';

const changelog = `
<a name="0.1.0"></a>
# 0.1.0 (2023-01-01)

### Bug Fixes

* fix issue A ([17c2c43](https://example.com/commit/abc))
* fix issue B ([17c2c43](https://example.com/commit/def))

### Features

* add feature X ([17c2c43](https://example.com/commit/ghi))
* add feature Y ([17c2c43](https://example.com/commit/jkl))
`;

const result = parseChangelog(changelog);
console.log(result);
```

### CommonJS

```javascript
const { parseChangelog } = require('cclog-parser');

const result = parseChangelog(changelog);
```

### Options

```typescript
interface ParseOptions {
  /**
   * Whether to include detailed commit information
   * @default true
   */
  includeDetails?: boolean;
}

const result = parseChangelog(changelog, {
  includeDetails: false,
});
```

## Output Format

The parser returns an object with the following structure:

```typescript
interface ParseResult {
  /** Array of version strings */
  versions: string[];
  /** Changes grouped by version */
  changes: Record<string, ChangeObject>;
}

interface ChangeObject {
  /** Bug fixes */
  fixes: string[];
  /** New features */
  features: string[];
  /** Breaking changes */
  breakingChanges: string[];
}
```

### Example Output

```javascript
{
  versions: ['0.1.0', '0.0.1'],
  changes: {
    '0.1.0': {
      fixes: [
        'fix issue A ([17c2c43](https://example.com/commit/abc))',
        'fix issue B ([17c2c43](https://example.com/commit/def))'
      ],
      features: [
        'add feature X ([17c2c43](https://example.com/commit/ghi))',
        'add feature Y ([17c2c43](https://example.com/commit/jkl))'
      ],
      breakingChanges: []
    }
  }
}
```

## Supported Formats

The parser supports multiple changelog formats:

### Standard Format

```markdown
<a name="1.0.0"></a>

# 1.0.0 (2023-01-01)

### Bug Fixes

- fix something

### Features

- add something

### BREAKING CHANGES

- breaking change
```

### Markdown Link Format

```markdown
# [1.0.0](https://github.com/user/repo/compare/v0.9.0...v1.0.0) (2023-01-01)

### Bug Fixes

- fix something

### Features

- add something
```

## Requirements

- Node.js >= 16.0.0

## Migration from v1.x

Version 2.0 introduces breaking changes:

- **ES Modules**: Package now uses ES modules by default
- **Node.js**: Minimum version requirement is now 16.0.0
- **TypeScript**: Full TypeScript rewrite with type definitions
- **API**: Import syntax has changed (see usage examples above)

### Migrating from v1.x

```javascript
// Old (v1.x)
const parser = require('cclog-parser');
const result = parser(changelog);

// New (v2.x) - ES Modules
import { parseChangelog } from 'cclog-parser';
const result = parseChangelog(changelog);

// New (v2.x) - CommonJS
const { parseChangelog } = require('cclog-parser');
const result = parseChangelog(changelog);
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [jserme](http://jser.me/)

[npm-img]: https://img.shields.io/npm/v/cclog-parser
[npm-url]: https://npmjs.com/package/cclog-parser
[build-img]: https://github.com/jserme/cclog-parser/workflows/CI/badge.svg
[build-url]: https://github.com/jserme/cclog-parser/actions
[coverage-img]: https://codecov.io/gh/jserme/cclog-parser/branch/master/graph/badge.svg
[coverage-url]: https://codecov.io/gh/jserme/cclog-parser
[downloads-img]: https://img.shields.io/npm/dm/cclog-parser.svg
