# COMMITVER

**Complete Git version management system** - Automatically prepend version numbers to commit messages and increment versions on every commit.

## Features

- **Automatic version prefixing** - Add version numbers to commit messages
- **Automatic version incrementing** - Increment patch version on each commit  
- **Customizable formats** - Choose from multiple commit message formats
- **VS Code integration** - Beautiful UI for settings management
- **Configuration file** - JSON-based configuration
- **Git hooks** - Works with any Git client
- **Zero dependencies** - Lightweight and fast

## Quick Start

### Method 1: Complete Project Setup (Recommended)

Create a new project with everything set up automatically:

```bash
# Create new project directory
mkdir my-new-project
cd my-new-project

# Run quick start (installs everything)
node ../git-version-commit/quick-start.js my-new-project

# That's it! Your project is ready.
```

### Method 2: Install to Existing Project

```bash
# Install to existing Git repository
npm install ../git-version-commit

# Or install hooks manually
npm run install-hooks
```

### Method 3: VS Code Extension

```bash
# Open settings UI in VS Code
npm run open-ui-ide
```

## What Gets Installed

**Git repository** (if not exists)  
**package.json** with version 1.0.0 (if not exists)  
**Git hooks** for automatic versioning  
**Configuration file** with default settings  
**README.md** with documentation  
**VS Code UI** for settings management  
**First commit** with automatic versioning  

## Available Formats

### 1. Version + Comment (Default)

```
v1.0.1 Add new feature
```

### 2. Version + Date + Comment

```
v1.0.1 2026-03-19 Add new feature
```

### 3. Comment + Version

```
Add new feature v1.0.1
```

### 4. Custom Template

```
${version} ${date} ${message}
```

## Configuration

Create `.commitver.json` in your project root:

```json
{
  "format": "version-comment",
  "template": "${version} ${message}",
  "includeDate": false,
  "dateFormat": "YYYY-MM-DD"
}
```

### Format Options

- `version-comment`: Version + Comment
- `version-date-comment`: Version + Date + Comment  
- `comment-version`: Comment + Version
- `custom`: Use custom template

### Date Formats

- `YYYY-MM-DD`: 2026-03-19
- `MM/DD/YYYY`: 03/19/2026
- `DD/MM/YYYY`: 19/03/2026

### Template Variables

- `${version}`: Current version (e.g., v1.0.1)
- `${date}`: Formatted date (if includeDate is true)
- `${message}`: Your commit message

## Usage

### Basic Usage

```bash
# Make changes
echo "New feature" > feature.txt

# Stage and commit
git add feature.txt
git commit -m "Add new feature"

# Result: v1.0.2 Add new feature
```

### VS Code Integration

```bash
# Open settings UI
npm run open-ui-ide

# Or use command palette
Ctrl+Shift+P → "COMMITVER"
```

### Configuration Management

```bash
# Open UI
npm run open-ui-ide

# Manual config edit
code .commitver.json
```

## Project Structure

```
commitver/
├── src/
│   ├── prepend_version.cjs    # Main versioning logic
│   └── formatter.js          # Message formatting
├── hooks/
│   ├── prepare-commit-msg    # Git hook for message formatting
│   └── pre-commit           # Git hook for version increment
├── scripts/
│   ├── install.js           # Complete installation
│   ├── quick-start.js        # New project setup
│   └── show-ui.js           # UI launcher
├── extension/
│   └── src/
│       └── extension.ts      # VS Code extension
├── config/
│   └── default.json         # Default configuration
└── package.json              # Package metadata
```

## Advanced Usage

### Custom Hooks

You can customize Git hooks:

```bash
# Edit hooks directly
code .git/hooks/prepare-commit-msg
code .git/hooks/pre-commit
```

### Team Collaboration

Share configuration with your team:

```bash
# Commit configuration file
git add .commitver.json
git commit -m "Add version commit configuration"

# Team members get same settings
git pull
```

### CI/CD Integration

Works with any CI/CD system:

```yaml
# GitHub Actions example
- name: Commit with version
  run: |
    git add .
    git commit -m "Auto release v${{ steps.version.outputs.version }}"
```

## Development

```bash
# Clone repository
git clone https://github.com/yourusername/commitver.git
cd commitver

# Install dependencies
npm install

# Run tests
npm test

# Build extension
npm run compile
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Support

- [Documentation](https://github.com/yourusername/commitver#readme)
- [Issues](https://github.com/yourusername/commitver/issues)
- [Discussions](https://github.com/yourusername/commitver/discussions)

---

**Made with ❤️ for developers who love clean version management**
