#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎨 Welcome to Git Version Commit!');
console.log('🌐 Opening UI...');

// Try to open UI in VS Code extension
const extensionPath = path.resolve(__dirname, '..');

// Validate extension path exists
const fs = require('fs');
if (!fs.existsSync(extensionPath)) {
  console.log('❌ Extension path not found:', extensionPath);
  process.exit(1);
}

// Open VS Code extension
const vscode = spawn('code', ['--extensionDevelopmentPath', extensionPath], {
  stdio: 'pipe',
  shell: false
});

vscode.on('close', (code) => {
  if (code !== 0) {
    console.log('❌ VS Code not found or extension path error');
    console.log('📁 Extension path:', extensionPath);
    
    // Fallback: open settings in browser
    const settingsUrl = 'https://github.com/yourusername/commitver#settings';
    const openCommand = process.platform === 'win32' ? 'start' :
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
    
    const browser = spawn(openCommand, [settingsUrl], {
      stdio: 'pipe',
      shell: false
    });
    
    browser.on('close', (browserCode) => {
      if (browserCode !== 0) {
        console.log('📁 Settings URL:', settingsUrl);
        console.log('💡 Please open the URL manually in your browser');
      } else {
        console.log('✅ Settings opened in browser (VS Code extension not available)');
      }
    });
    
    browser.on('error', (browserError) => {
      console.log('📁 Settings URL:', settingsUrl);
      console.log('💡 Please open the URL manually in your browser');
    });
  } else {
    console.log('✅ UI opened in VS Code!');
    console.log('🔍 Look for "Git Version Commit UI" in the activity bar or run the command');
  }
});

vscode.on('error', (error) => {
  console.log('❌ Failed to start VS Code:', error.message);
  console.log('💡 Please ensure VS Code is installed and accessible via the "code" command');
});

console.log('📖 Usage: Just commit as usual - version will be added automatically!');
console.log('🚀 Happy coding with Git Version Commit!');
