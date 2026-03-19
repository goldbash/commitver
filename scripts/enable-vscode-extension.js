#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Enabling VS Code extension for Git Version Commit...');

const extensionPath = path.resolve(__dirname, '..', 'extension');

// Validate extension path exists
const fs = require('fs');
if (!fs.existsSync(extensionPath)) {
  console.log('❌ Extension path not found:', extensionPath);
  process.exit(1);
}

// Open VS Code extension in development mode
const vscode = spawn('code', ['--extensionDevelopmentPath', extensionPath], {
  stdio: 'pipe',
  shell: false
});

vscode.on('close', (code) => {
  if (code !== 0) {
    console.log('❌ Failed to open VS Code extension development mode');
    console.log('📁 Extension path:', extensionPath);
    console.log('💡 Please manually open VS Code with: code --extensionDevelopmentPath="' + extensionPath + '"');
  } else {
    console.log('✅ VS Code extension development mode started!');
    console.log('🔍 Look for "Git Version Commit UI" in the activity bar');
    console.log('💡 Or press Ctrl+Shift+P and search "Git Version Commit"');
    console.log('🎨 The UI should appear in the center of VS Code');
  }
});

vscode.on('error', (error) => {
  console.log('❌ Failed to start VS Code:', error.message);
  console.log('💡 Please ensure VS Code is installed and accessible via the "code" command');
});

console.log('📖 Usage: Just commit as usual - version will be added automatically!');
console.log('🎉 Happy coding with Git Version Commit!');
