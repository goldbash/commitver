# COMMITVER

**Simple Git version management** - Automatically add version numbers to your commit messages with one click.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 What is COMMITVER?

COMMITVER is a comprehensive version management system that automatically adds semantic version numbers to your Git commits. It works seamlessly across different environments - CLI tools, VS Code extensions, and more.

## ✨ Features

- 🎯 **Automatic version prefixing** - Version numbers added to commit messages
- 🔄 **Automatic version incrementing** - Patch version increments on each commit automatically  
- ⚙️ **Zero configuration** - Works out of the box
- 🎨 **Simple to use** - Just commit normally
- 💻 **VS Code integration** - Quick commit command available
- 📦 **Monorepo architecture** - Shared logic across all platforms
- 🌐 **Cross-platform** - Works with CLI, VS Code, and future integrations

## 📦 Packages

This monorepo contains multiple packages that work together:

### [@commitver/core](./packages/core/)
Core library containing shared logic for version management.

```bash
npm install @commitver/core
```

### [@commitver/cli](./packages/cli/)
Command-line interface for Git hooks and terminal usage.

```bash
npm install -g @commitver/cli
```

### [commitver (VS Code Extension)](./packages/vscode-extension/)
VS Code extension for seamless IDE integration.

- Status: Coming soon to VS Code Marketplace

## 🎯 Quick Start

### Method 1: CLI Tool (Recommended)

```bash
# Install globally
npm install -g @commitver/cli

# Install git hooks
commitver install-hooks

# Make changes and commit normally
git add .
git commit -m "Add new feature"
# Result: v1.0.1 Add new feature
```

### Method 2: Core Library

```typescript
import { CommitverCore } from '@commitver/core';

const core = new CommitverCore();
const result = await core.processCommitMessage('Add new feature');
console.log(result.formatted); // "v1.0.1 Add new feature"
```

## 📋 Version Format

**Major.Minor.Patch**

Example: `v1.0.2`
- **Major**: 1 (Breaking changes)
- **Minor**: 0 (New features)  
- **Patch**: 2 (Bug fixes)

## 🏗️ Architecture

This project uses a monorepo structure with shared core logic:

```
commitver-monorepo/
├── packages/
│   ├── core/           # Shared logic (used by all packages)
│   ├── cli/            # Command-line interface
│   └── vscode-extension/ # VS Code extension
├── docs/               # Documentation
├── websites/           # Official website
└── .github/workflows/  # CI/CD automation
```

### Benefits of This Architecture

- **🔄 Shared Logic**: Core functionality is centralized, reducing duplication
- **🚀 Consistent Behavior**: All platforms use the same versioning logic
- **🔧 Easy Maintenance**: Bug fixes and features update across all packages
- **📈 Scalability**: Easy to add new platforms (IntelliJ, GitHub Actions, etc.)

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/1abcdefggs/commitver.git
cd commitver

# Install dependencies
npm install

# Build all packages
npm run build
```

### Project Structure

- `packages/core/` - Core version management logic
- `packages/cli/` - CLI tool and Git hooks
- `packages/vscode-extension/` - VS Code extension
- `docs/` - Documentation for each package
- `.github/workflows/` - CI/CD pipelines

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build:core
npm run build:cli
npm run build:vscode
```

## 📚 Documentation

- [Core API Documentation](./packages/core/README.md)
- [CLI Usage Guide](./packages/cli/README.md)
- [VS Code Extension Guide](./packages/vscode-extension/README.md)
- [Architecture Documentation](./docs/architecture/)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all [contributors](https://github.com/1abcdefggs/commitver/graphs/contributors)
- Built with TypeScript and modern JavaScript
- Inspired by semantic versioning best practices

## 📞 Support

- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/1abcdefggs/commitver/issues)
- 💬 [Discussions](https://github.com/1abcdefggs/commitver/discussions)

---

**Made with ❤️ for simple version management**
