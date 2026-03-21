# @commitver/core

Core library for COMMITVER - shared logic across CLI and VS Code extension.

## Features

- **Version Management**: Parse, format, and increment semantic versions
- **Commit Message Processing**: Automatically add version numbers to commit messages
- **Configuration Management**: Load and save configuration files
- **Package.json Integration**: Read and update package.json versions

## Installation

```bash
npm install @commitver/core
```

## Usage

```typescript
import { CommitverCore } from '@commitver/core';

const core = new CommitverCore({
  autoIncrement: 'patch',
  prefix: 'v',
  separator: '.'
});

// Process a commit message
const result = await core.processCommitMessage('Add new feature');
console.log(result.formatted); // "v1.0.1 Add new feature"

// Parse version
const version = core.parseVersion('v1.0.2');
console.log(version); // { major: 1, minor: 0, patch: 2 }

// Increment version
const newVersion = core.incrementVersion(version, 'minor');
console.log(core.formatVersion(newVersion)); // "v1.1.0"
```

## API

### CommitverCore

#### Constructor

```typescript
new CommitverCore(config?: Partial<CommitverConfig>)
```

#### Methods

- `parseVersion(versionString: string): Version | null`
- `formatVersion(version: Version): string`
- `incrementVersion(version: Version, type?: 'patch' | 'minor' | 'major'): Version`
- `getCurrentVersion(packageJsonPath?: string): Promise<Version>`
- `updatePackageVersion(packageJsonPath: string, version: Version): Promise<void>`
- `processCommitMessage(message: string, packageJsonPath?: string): Promise<CommitMessage>`
- `loadConfig(configPath?: string): Promise<CommitverConfig>`
- `saveConfig(config: CommitverConfig, configPath?: string): Promise<void>`

### Types

```typescript
interface Version {
  major: number;
  minor: number;
  patch: number;
}

interface CommitMessage {
  version: Version;
  message: string;
  formatted: string;
}

interface CommitverConfig {
  versionFormat: string;
  autoIncrement: 'patch' | 'minor' | 'major' | 'none';
  prefix: string;
  separator: string;
}
```

## License

MIT License
