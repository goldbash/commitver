#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('');
console.log('🚀 Git Version Commit - Welcome!');
console.log('📦 Setting up complete Git version management system...');
console.log('');

// 
const projectRoot = process.cwd();
const hooksDir = path.join(projectRoot, '.git', 'hooks');
const srcDir = path.join(__dirname, '..', 'hooks');

console.log('📁 Project root:', projectRoot);

// Helper function for async operations
function promisify(fn) {
  return (...args) => new Promise((resolve, reject) => {
    fn(...args, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

async function initializeGit() {
  if (!fs.existsSync(path.join(projectRoot, '.git'))) {
    console.log('🔧 Initializing Git repository...');
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const gitInit = spawn('git', ['init'], { 
        cwd: projectRoot,
        stdio: 'pipe',
        shell: false 
      });
      
      gitInit.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Failed to initialize Git repository'));
        } else {
          console.log('✅ Git repository initialized!');
          resolve();
        }
      });
      
      gitInit.on('error', reject);
    });
  } else {
    console.log('✅ Git repository already exists');
    return Promise.resolve();
  }
}

async function proceedWithInstallation() {
  try {
    // 2. package.json
    await createPackageJson();
    
    // 3. .git/hooks
    await createHooksDirectory();
    
    // 4. Backup existing hooks
    await backupExistingHooks();
    
    // 5. Install new hooks
    await installHooks();
    
    // 6. Adjust hook paths
    adjustHookPaths(hooksDir, projectRoot);
    
    // 7. Create default config
    createDefaultConfig(projectRoot);
    
    console.log('✅ Git hooks installed successfully!');
    
    // 8. Open UI
    openUI(projectRoot);
    
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  }
}

async function createPackageJson() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('📄 Creating package.json...');
    const packageJson = {
      name: path.basename(projectRoot),
      version: '1.0.0',
      description: 'Project with automatic version commits',
      main: 'index.js',
      scripts: {
        test: 'echo "Error: no test specified" && exit 1'
      },
      keywords: [],
      author: '',
      license: 'MIT',
      dependencies: {}
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log('✅ package.json created with version 1.0.0');
  } else {
    console.log('✅ package.json already exists');
  }
}

async function createHooksDirectory() {
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
    console.log('📁 Created hooks directory:', hooksDir);
  }
}

async function backupExistingHooks() {
  const backupDir = path.join(projectRoot, '.git', 'hooks', 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const hooks = ['prepare-commit-msg', 'pre-commit'];
  hooks.forEach(hook => {
    const hookPath = path.join(hooksDir, hook);
    const backupPath = path.join(backupDir, hook);
    
    if (fs.existsSync(hookPath)) {
      fs.copyFileSync(hookPath, backupPath);
      console.log('💾 Backed up existing hook:', hook);
    }
  });
}

async function installHooks() {
  const hooks = ['prepare-commit-msg', 'pre-commit'];
  hooks.forEach(hook => {
    const srcHook = path.join(srcDir, hook);
    const destHook = path.join(hooksDir, hook);
    
    if (fs.existsSync(srcHook)) {
      try {
        fs.copyFileSync(srcHook, destHook);
        console.log('✅ Installed hook:', hook);
        
        // Set executable permissions on Unix-like systems
        if (process.platform !== 'win32') {
          try {
            fs.chmodSync(destHook, '755');
          } catch (chmodError) {
            console.warn(`⚠️ Warning: Could not set executable permissions for ${hook}:`, chmodError.message);
          }
        }
      } catch (copyError) {
        console.error(`❌ Failed to install hook ${hook}:`, copyError.message);
      }
    } else {
      console.log('❌ Hook not found:', srcHook);
    }
  });
}

// Start installation
initializeGit().then(proceedWithInstallation).catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});

function createDefaultConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.commitver.json');
  
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      format: 'version-comment',
      template: '${version} ${message}',
      includeDate: false,
      dateFormat: 'YYYY-MM-DD',
      versionPosition: 'prefix'
    };
    
    try {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
      console.log('⚙️ Created default configuration:', configPath);
    } catch (error) {
      console.error('❌ Failed to create configuration:', error);
    }
  } else {
    console.log('⚙️ Configuration already exists:', configPath);
  }
}

function openUI(projectRoot) {
  console.log('🎨 Opening Git Version Commit UI...');
  
  const uiPath = path.join(__dirname, '..', 'ui', 'index.html');
  const extensionPath = path.join(__dirname, '..');

  // Validate paths exist
  if (!fs.existsSync(extensionPath)) {
    console.log('❌ Extension path not found:', extensionPath);
    return;
  }

  const { spawn } = require('child_process');

  // VS Code
  const vscode = spawn('code', ['--extensionDevelopmentPath', extensionPath], {
    stdio: 'pipe',
    shell: false
  });

  vscode.on('close', (code) => {
    if (code !== 0) {
      console.log('❌ VS Code extension development mode not available');
      console.log('🌐 Falling back to browser...');
      
      // Safe browser open
      const openCommand = process.platform === 'win32' ? 'start' :
                         process.platform === 'darwin' ? 'open' : 'xdg-open';
      
      const browser = spawn(openCommand, [uiPath], {
        stdio: 'pipe',
        shell: false
      });
      
      browser.on('close', (browserCode) => {
        if (browserCode !== 0) {
          console.log('📁 UI file location:', uiPath);
          console.log('💡 Please open the file manually in your browser');
        } else {
          console.log('✅ UI opened in browser (IDE extension not available)');
        }
      });
    } else {
      console.log('✅ UI opened in VS Code extension development mode!');
      console.log('🔍 Look for "Git Version Commit UI" in the activity bar');
      console.log('💡 Or press Ctrl+Shift+P and search "Git Version Commit"');
    }
  });
}

function adjustHookPaths(hooksDir, projectRoot) {
  const prepareMsgPath = path.join(hooksDir, 'prepare-commit-msg');
  
  if (fs.existsSync(prepareMsgPath)) {
    let content;
    try {
      content = fs.readFileSync(prepareMsgPath, 'utf8');
    } catch (error) {
      console.error('❌ Failed to read prepare-commit-msg:', error.message);
      return;
    }
    
    // node_modules path resolution
    const nodeModulesPath = path.join(projectRoot, 'node_modules', 'git-version-commit', 'src', 'prepend_version.cjs');
    const localPath = path.join(__dirname, '..', 'src', 'prepend_version.cjs');
    
    let targetPath;
    if (fs.existsSync(nodeModulesPath)) {
      targetPath = nodeModulesPath;
    } else if (fs.existsSync(localPath)) {
      targetPath = localPath;
    } else {
      console.log('⚠️ Warning: Could not find prepend_version.cjs, hook may not work');
      return;
    }
    
    // Escape path for shell
    const escapedPath = targetPath.replace(/\\/g, '/');
    content = content.replace(/node\s+.*?prepend_version\.cjs/, `node "${escapedPath}"`);
    
    try {
      fs.writeFileSync(prepareMsgPath, content, 'utf8');
      console.log('🔧 Adjusted prepare-commit-msg path');
    } catch (error) {
      console.error('❌ Failed to write prepare-commit-msg:', error.message);
    }
  }
  
  console.log('🔧 Hook paths adjusted for this project');
}

// 9. 
console.log('');
console.log('🎉 Git Version Commit setup completed successfully!');
console.log('');
console.log('📋 What was installed:');
console.log('   ✅ Git repository (if needed)');
console.log('   ✅ package.json with version 1.0.0 (if needed)');
console.log('   ✅ Git hooks for automatic versioning');
console.log('   ✅ Configuration file for custom formats');
console.log('   ✅ UI for settings management');
console.log('');
console.log('🚀 Ready to use! Try your first commit:');
console.log('   echo "Initial commit" > README.md');
console.log('   git add README.md');
console.log('   git commit -m "Initial commit"');
console.log('');
console.log('💡 The version will be automatically added to your commit message!');
console.log('🎨 Open settings: npm run open-ui-ide (if installed as dependency)');
console.log('📖 Documentation: Check README.md for advanced usage');
console.log('');
console.log('🌟 Thank you for using Git Version Commit!');
console.log('   Your commits will now be beautifully versioned automatically! 🎊');
