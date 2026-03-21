export interface Version {
  major: number;
  minor: number;
  patch: number;
}

export interface CommitMessage {
  version: Version;
  message: string;
  formatted: string;
}

export interface CommitverConfig {
  versionFormat: string;
  autoIncrement: 'patch' | 'minor' | 'major' | 'none';
  prefix: string;
  separator: string;
}

export class CommitverCore {
  private config: CommitverConfig;

  constructor(config?: Partial<CommitverConfig>) {
    this.config = {
      versionFormat: 'v{version}',
      autoIncrement: 'patch',
      prefix: 'v',
      separator: '.',
      ...config
    };
  }

  /**
   * Parse version string to Version object
   */
  parseVersion(versionString: string): Version | null {
    const match = versionString.match(/v?(\d+)\.(\d+)\.(\d+)/);
    if (!match) return null;

    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }

  /**
   * Format Version object to string
   */
  formatVersion(version: Version): string {
    return `${this.config.prefix}${version.major}${this.config.separator}${version.minor}${this.config.separator}${version.patch}`;
  }

  /**
   * Increment version based on configuration
   */
  incrementVersion(version: Version, type?: 'patch' | 'minor' | 'major'): Version {
    const incrementType = type || this.config.autoIncrement;
    
    if (incrementType === 'none') return version;

    const newVersion = { ...version };

    switch (incrementType) {
      case 'major':
        newVersion.major++;
        newVersion.minor = 0;
        newVersion.patch = 0;
        break;
      case 'minor':
        newVersion.minor++;
        newVersion.patch = 0;
        break;
      case 'patch':
        newVersion.patch++;
        break;
    }

    return newVersion;
  }

  /**
   * Get current version from package.json
   */
  async getCurrentVersion(packageJsonPath: string = './package.json'): Promise<Version> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      const versionString = packageJson.version || '1.0.0';
      const version = this.parseVersion(versionString);
      
      return version || { major: 1, minor: 0, patch: 0 };
    } catch (error) {
      return { major: 1, minor: 0, patch: 0 };
    }
  }

  /**
   * Update package.json version
   */
  async updatePackageVersion(packageJsonPath: string, version: Version): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      packageJson.version = `${version.major}.${version.minor}.${version.patch}`;
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      throw new Error(`Failed to update package version: ${error}`);
    }
  }

  /**
   * Process commit message with version
   */
  async processCommitMessage(
    message: string, 
    packageJsonPath?: string
  ): Promise<CommitMessage> {
    // Get current version
    const currentVersion = packageJsonPath 
      ? await this.getCurrentVersion(packageJsonPath)
      : { major: 1, minor: 0, patch: 0 };

    // Increment version
    const newVersion = this.incrementVersion(currentVersion);

    // Format version string
    const versionString = this.formatVersion(newVersion);

    // Clean message (remove existing version if present)
    const cleanMessage = this.cleanMessage(message);

    // Create formatted commit message
    const formatted = cleanMessage 
      ? `${versionString} ${cleanMessage}`
      : `${versionString} Auto commit`;

    return {
      version: newVersion,
      message: cleanMessage || 'Auto commit',
      formatted
    };
  }

  /**
   * Remove existing version from message
   */
  private cleanMessage(message: string): string {
    // Remove version pattern (e.g., "v1.0.2 ") from beginning
    return message.replace(/^v?\d+\.\d+\.\d+\s*/, '').trim();
  }

  /**
   * Load configuration from file
   */
  async loadConfig(configPath: string = './.commitver.json'): Promise<CommitverConfig> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      
      return { ...this.config, ...config };
    } catch (error) {
      return this.config;
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfig(config: CommitverConfig, configPath: string = './.commitver.json'): Promise<void> {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }
}

// Export singleton instance
export const commitverCore = new CommitverCore();
