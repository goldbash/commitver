const fs = require('fs');
const path = require('path');

class CommitMessageFormatter {
  constructor(config = {}) {
    this.config = this.mergeConfig(config);
  }

  mergeConfig(userConfig) {
    const defaultConfig = require('../config/default.json');
    
    // Validate userConfig
    const validatedConfig = this.validateConfig(userConfig);
    
    return { ...defaultConfig, ...validatedConfig };
  }

  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      return {};
    }

    const validFormats = ['version-comment', 'version-date-comment', 'comment-version', 'custom'];
    const validDateFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'];
    
    const validated = {};
    
    if (config.format && validFormats.includes(config.format)) {
      validated.format = config.format;
    }
    
    if (config.template && typeof config.template === 'string' && config.template.trim().length > 0) {
      validated.template = config.template.trim();
    }
    
    if (typeof config.includeDate === 'boolean') {
      validated.includeDate = config.includeDate;
    }
    
    if (config.dateFormat && validDateFormats.includes(config.dateFormat)) {
      validated.dateFormat = config.dateFormat;
    }
    
    if (config.versionPosition && ['prefix', 'suffix'].includes(config.versionPosition)) {
      validated.versionPosition = config.versionPosition;
    }
    
    return validated;
  }

  loadConfig() {
    const configPaths = [
      path.join(process.cwd(), '.commitver.json'),
      path.join(process.cwd(), '.git-version-commit.json'),
      path.join(process.cwd(), '.git-version-commit/config.json'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.commitver.json'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.git-version-commit.json')
    ];

    for (const configPath of configPaths) {
      try {
        if (fs.existsSync(configPath)) {
          let configData;
          try {
            configData = fs.readFileSync(configPath, 'utf8');
          } catch (readError) {
            console.error(`⚠️ Warning: Failed to read config from ${configPath}:`, readError.message);
            continue;
          }
          
          try {
            const userConfig = JSON.parse(configData);
            return this.mergeConfig(userConfig);
          } catch (parseError) {
            console.error(`⚠️ Warning: Failed to parse config from ${configPath}:`, parseError.message);
            continue;
          }
        }
      } catch (error) {
        console.error(`⚠️ Warning: Failed to load config from ${configPath}:`, error.message);
        continue;
      }
    }

    return this.mergeConfig({});
  }

  formatMessage(message) {
    if (!message || typeof message !== 'string') {
      message = 'Empty commit message';
    }

    const config = this.loadConfig();
    const version = this.getVersion();
    const date = this.getDate();

    let formattedMessage = config.template || '${version} ${message}';

    // 
    formattedMessage = formattedMessage.replace(/\${version}/g, version || 'v0.0.0');
    formattedMessage = formattedMessage.replace(/\${date}/g, date || '');
    formattedMessage = formattedMessage.replace(/\${message}/g, message.trim());

    return formattedMessage;
  }

  getVersion() {
    try {
      const pkgPath = path.resolve(process.cwd(), 'package.json');
      
      if (!fs.existsSync(pkgPath)) {
        console.warn('⚠️ Warning: package.json not found, using default version');
        return 'v0.0.0';
      }
      
      let pkgData;
      try {
        pkgData = fs.readFileSync(pkgPath, 'utf8');
      } catch (readError) {
        console.error('❌ Failed to read package.json:', readError.message);
        return 'v0.0.0';
      }
      
      try {
        const pkg = JSON.parse(pkgData);
        if (pkg.version && typeof pkg.version === 'string') {
          return `v${pkg.version}`;
        } else {
          console.warn('⚠️ Warning: Invalid version in package.json, using default');
          return 'v0.0.0';
        }
      } catch (parseError) {
        console.error('❌ Failed to parse package.json:', parseError.message);
        return 'v0.0.0';
      }
    } catch (error) {
      console.error('❌ Unexpected error getting version:', error.message);
      return 'v0.0.0';
    }
  }

  getDate() {
    const config = this.loadConfig();
    const now = new Date();
    
    if (!config.includeDate) {
      return '';
    }

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    switch (config.dateFormat) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  saveConfig(newConfig) {
    const configPath = path.join(process.cwd(), '.commitver.json');
    try {
      fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
      console.log('✅ Configuration saved to:', configPath);
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
      throw error;
    }
  }
}

module.exports = CommitMessageFormatter;
