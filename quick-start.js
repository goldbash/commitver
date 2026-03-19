#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('');
console.log('🚀 Git Version Commit - Quick Start');
console.log('📦 Setting up new project with automatic version commits...');
console.log('');

// 
const projectName = process.argv[2] || path.basename(process.cwd());
const projectRoot = process.cwd();

console.log('📁 Project:', projectName);
console.log('📂 Location:', projectRoot);

// 1. Git
if (!fs.existsSync(path.join(projectRoot, '.git'))) {
  console.log('🔧 Initializing Git repository...');
  const { spawn } = require('child_process');
  
  const gitInit = spawn('git', ['init'], { 
    cwd: projectRoot,
    stdio: 'pipe',
    shell: false 
  });
  
  gitInit.on('close', (code) => {
    if (code !== 0) {
      console.log('❌ Failed to initialize Git');
      process.exit(1);
    }
    console.log('✅ Git repository initialized!');
    setupProject();
  });
  
  gitInit.on('error', (error) => {
    console.log('❌ Failed to initialize Git:', error.message);
    process.exit(1);
  });
} else {
  console.log('✅ Git repository already exists');
  setupProject();
}

function setupProject() {
  // 2. package.json
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('📄 Creating package.json...');
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: `${projectName} - Project with automatic version commits`,
      main: 'index.js',
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
        'version-commit': 'node node_modules/git-version-commit/scripts/install.js'
      },
      keywords: ['git', 'version', 'commit', 'automation'],
      author: '',
      license: 'MIT',
      dependencies: {
        'git-version-commit': 'file:../git-version-commit'
      }
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json created with version 1.0.0');
  } else {
    console.log('✅ package.json already exists');
  }

  // 3. README.md
  const readmePath = path.join(projectRoot, 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.log('📖 Creating README.md...');
    const readme = `# ${projectName}

Project with automatic version commits powered by Git Version Commit.

## Features

- ✅ Automatic version prefixing
- ✅ Automatic version incrementing  
- ✅ Customizable message formats
- ✅ VS Code integration

## Quick Start

1. Make your first commit:
   \`\`\`bash
   echo "Initial setup" > setup.txt
   git add setup.txt
   git commit -m "Initial setup"
   \`\`\`

2. Check the result:
   \`\`\`bash
   git log --oneline
   \`\`\`

## Configuration

Edit \`.git-version-commit.json\` to customize your commit message format:

\`\`\`json
{
  "format": "version-comment",
  "template": "\${version} \${message}",
  "includeDate": false,
  "dateFormat": "YYYY-MM-DD"
}
\`\`\`

## Available Formats

- \`version-comment\`: \`v1.0.1 Your message\`
- \`version-date-comment\`: \`v1.0.1 2026-03-19 Your message\`
- \`comment-version\`: \`Your message v1.0.1\`
- \`custom\`: Use your own template

---

Made with ❤️ by Git Version Commit
`;
    
    fs.writeFileSync(readmePath, readme);
    console.log('✅ README.md created');
  } else {
    console.log('✅ README.md already exists');
  }

  // 4. git-version-commit
  console.log('📦 Installing git-version-commit...');
  const { spawn } = require('child_process');
  
  const npmInstall = spawn('npm', ['install', '../git-version-commit'], {
    cwd: projectRoot,
    stdio: 'pipe',
    shell: false
  });
  
  npmInstall.on('close', (code) => {
    if (code !== 0) {
      console.log('❌ Failed to install git-version-commit');
      console.log('💡 Please install manually: npm install ../git-version-commit');
    } else {
      console.log('✅ git-version-commit installed successfully!');
      console.log('');
      
      // 5. 
      console.log('🎯 Creating your first automatic version commit...');
      const gitAdd = spawn('git', ['add', '.'], {
        cwd: projectRoot,
        stdio: 'pipe',
        shell: false
      });
      
      gitAdd.on('close', (addCode) => {
        if (addCode !== 0) {
          console.log('❌ Failed to stage files');
        } else {
          const gitCommit = spawn('git', ['commit', '-m', 'Initial project setup'], {
            cwd: projectRoot,
            stdio: 'pipe',
            shell: false
          });
          
          gitCommit.on('close', (commitCode) => {
            if (commitCode !== 0) {
              console.log('❌ Failed to commit');
            } else {
              console.log('✅ First commit created successfully!');
              console.log('');
              
              // 6. 
              const gitLog = spawn('git', ['log', '--oneline', '-1'], {
                cwd: projectRoot,
                stdio: 'pipe',
                shell: false
              });
              
              let logOutput = '';
              gitLog.stdout.on('data', (data) => {
                logOutput += data.toString();
              });
              
              gitLog.on('close', () => {
                console.log('📋 Your commit history:');
                console.log(logOutput);
                console.log('');
                console.log('🎉 Project setup completed successfully!');
                console.log('');
                console.log('📖 Next steps:');
                console.log('   1. Open VS Code: code .');
                console.log('   2. Open settings: npm run open-ui-ide');
                console.log('   3. Make more commits with automatic versioning!');
                console.log('');
                console.log('💡 Your commits will now automatically include version numbers!');
                console.log('🌟 Thank you for choosing Git Version Commit! 🎊');
              });
            }
          });
        }
      });
    }
  });
}
