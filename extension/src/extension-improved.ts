import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('COMMITVER extension is now active!');

    // Register command
    let disposable = vscode.commands.registerCommand('commitver.showUI', () => {
        showCommitverUI(context);
    });

    context.subscriptions.push(disposable);

    // Get configuration
    const config = vscode.workspace.getConfiguration('commitver');
    const autoShowUI = config.get<boolean>('autoShowUI', true);
    const uiPosition = config.get<string>('uiPosition', 'center');

    // Auto show on startup
    if (autoShowUI) {
        showCommitverUI(context);
    }
}

function showCommitverUI(context: vscode.ExtensionContext) {
    // Get configuration
    const config = vscode.workspace.getConfiguration('commitver');
    const uiPosition = config.get<string>('uiPosition', 'center');

    // Determine WebView panel position
    let viewColumn: vscode.ViewColumn;
    switch (uiPosition) {
        case 'left':
            viewColumn = vscode.ViewColumn.One;
            break;
        case 'right':
            viewColumn = vscode.ViewColumn.Two;
            break;
        default:
            viewColumn = vscode.ViewColumn.One;
            break;
    }

    // Create WebView panel
    const panel = vscode.window.createWebviewPanel(
        'commitverUI',
        'COMMITVER',
        viewColumn,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(__dirname, '..', '..'))]
        }
    );

    // Generate HTML content
    const htmlContent = generateSecureSettingsHTML(panel.webview);
    panel.webview.html = htmlContent;

    // Handle messages from WebView
    const messageDisposable = panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'saveConfig':
                    saveConfigurationSafely(message.config);
                    break;
                case 'loadConfig':
                    loadConfigurationSafely(panel.webview);
                    break;
            }
        },
        undefined,
        context.subscriptions
    );

    // Monitor configuration changes
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('commitver')) {
            loadConfigurationSafely(panel.webview);
        }
    });

    // Clean up when panel is disposed
    const panelDisposable = panel.onDidDispose(() => {
        messageDisposable.dispose();
        configChangeDisposable.dispose();
    });

    context.subscriptions.push(panelDisposable);
}

function generateSecureSettingsHTML(webview: vscode.Webview): string {
    // Load configuration safely
    const config = loadConfigurationSafelyFromDisk();
    
    // Function to escape HTML
    const escapeHtml = (text: string): string => {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    // Function to validate template variables
    const validateTemplate = (template: string): boolean => {
        const allowedVars = ['${version}', '${date}', '${message}'];
        const templateVars = template.match(/\$\{[^}]+\}/g) || [];
        
        for (const templateVar of templateVars) {
            if (!allowedVars.includes(templateVar)) {
                return false;
            }
        }
        return true;
    };
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
        <title>COMMITVER Settings</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 20px;
                background: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 24px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
            }
            select, input, textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                font-size: 14px;
                box-sizing: border-box;
            }
            textarea {
                height: 80px;
                resize: vertical;
            }
            button {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            button:hover {
                background: var(--vscode-button-hoverBackground);
            }
            .preview {
                background: var(--vscode-textBlockQuote-background);
                border-left: 4px solid var(--vscode-textBlockQuote-border);
                padding: 12px;
                margin-top: 16px;
                border-radius: 0 4px 4px 0;
            }
            .title {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 24px;
                color: var(--vscode-foreground);
            }
            .error {
                color: var(--vscode-errorForeground);
                background: var(--vscode-inputValidation-errorBackground);
                border: 1px solid var(--vscode-inputValidation-errorBorder);
                padding: 8px;
                border-radius: 4px;
                margin-top: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="title">COMMITVER Settings</h1>
            
            <div class="form-group">
                <label for="format">Commit Message Format</label>
                <select id="format">
                    <option value="version-comment" ${config.format === 'version-comment' ? 'selected' : ''}>Version + Comment</option>
                    <option value="version-date-comment" ${config.format === 'version-date-comment' ? 'selected' : ''}>Version + Date + Comment</option>
                    <option value="comment-version" ${config.format === 'comment-version' ? 'selected' : ''}>Comment + Version</option>
                    <option value="custom" ${config.format === 'custom' ? 'selected' : ''}>Custom Template</option>
                </select>
            </div>

            <div class="form-group">
                <label for="template">Template</label>
                <textarea id="template" placeholder="e.g., \${version} \${date} \${message}">${escapeHtml(config.template)}</textarea>
            </div>

            <div class="form-group">
                <label for="includeDate">Include Date</label>
                <select id="includeDate">
                    <option value="true" ${config.includeDate ? 'selected' : ''}>Yes</option>
                    <option value="false" ${!config.includeDate ? 'selected' : ''}>No</option>
                </select>
            </div>

            <div class="form-group">
                <label for="dateFormat">Date Format</label>
                <select id="dateFormat">
                    <option value="YYYY-MM-DD" ${config.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY" ${config.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY" ${config.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                </select>
            </div>

            <div class="form-group">
                <label>Preview</label>
                <div class="preview" id="preview">
                    v1.0.8 Add new feature
                </div>
                <div id="error-message" class="error" style="display: none;"></div>
            </div>

            <button onclick="saveSettings()">Save Settings</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            
            function validateTemplateInput(template) {
                const allowedVars = ['\${version}', '\${date}', '\${message}'];
                const templateVars = template.match(/\$\{[^}]+\}/g) || [];
                
                for (const templateVar of templateVars) {
                    if (!allowedVars.includes(templateVar)) {
                        return false;
                    }
                }
                return true;
            }
            
            function saveSettings() {
                const template = document.getElementById('template').value;
                
                // Validate template
                if (!validateTemplateInput(template)) {
                    const errorDiv = document.getElementById('error-message');
                    errorDiv.textContent = 'Invalid template: Only \${version}, \${date}, and \${message} variables are allowed';
                    errorDiv.style.display = 'block';
                    return;
                }
                
                // Hide error
                const errorDiv = document.getElementById('error-message');
                errorDiv.style.display = 'none';
                
                const config = {
                    format: document.getElementById('format').value,
                    template: template,
                    includeDate: document.getElementById('includeDate').value === 'true',
                    dateFormat: document.getElementById('dateFormat').value
                };
                
                vscode.postMessage({
                    command: 'saveConfig',
                    config: config
                });
            }
            
            function updatePreview() {
                const template = document.getElementById('template').value;
                const includeDate = document.getElementById('includeDate').value === 'true';
                const dateFormat = document.getElementById('dateFormat').value;
                
                // Validate template
                if (!validateTemplateInput(template)) {
                    const errorDiv = document.getElementById('error-message');
                    errorDiv.textContent = 'Invalid template detected';
                    errorDiv.style.display = 'block';
                    return;
                }
                
                // Hide error
                const errorDiv = document.getElementById('error-message');
                errorDiv.style.display = 'none';
                
                let preview = template
                    .replace(/\${version}/g, 'v1.0.8')
                    .replace(/\${message}/g, 'Add new feature');
                
                if (includeDate) {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    
                    let dateStr;
                    switch (dateFormat) {
                        case 'YYYY-MM-DD':
                            dateStr = \`\${year}-\${month}-\${day}\`;
                            break;
                        case 'MM/DD/YYYY':
                            dateStr = \`\${month}/\${day}/\${year}\`;
                            break;
                        case 'DD/MM/YYYY':
                            dateStr = \`\${day}/\${month}/\${year}\`;
                            break;
                    }
                    
                    preview = preview.replace(/\${date}/g, dateStr);
                }
                
                document.getElementById('preview').textContent = preview;
            }
            
            // Event listeners
            document.getElementById('format').addEventListener('change', updatePreview);
            document.getElementById('template').addEventListener('input', updatePreview);
            document.getElementById('includeDate').addEventListener('change', updatePreview);
            document.getElementById('dateFormat').addEventListener('change', updatePreview);
            
            // Initialize
            window.addEventListener('load', updatePreview);
        </script>
    </body>
    </html>`;
}

function loadConfigurationSafelyFromDisk() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        // Default configuration when no workspace
        return {
            format: 'version-comment',
            template: '${version} ${message}',
            includeDate: false,
            dateFormat: 'YYYY-MM-DD'
        };
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const configPath = path.join(workspaceRoot, '.git-version-commit.json');
    
    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            
            // Validate configuration
            return validateConfig(config);
        }
    } catch (error) {
        console.error('Failed to load configuration:', error);
        vscode.window.showErrorMessage(`Failed to load configuration: ${error}`);
    }
    
    // Return default configuration
    return {
        format: 'version-comment',
        template: '${version} ${message}',
        includeDate: false,
        dateFormat: 'YYYY-MM-DD'
    };
}

function validateConfig(config: any) {
    // Validate configuration values
    const validFormats = ['version-comment', 'version-date-comment', 'comment-version', 'custom'];
    const validDateFormats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'];
    
    if (!validFormats.includes(config.format)) {
        config.format = 'version-comment';
    }
    
    if (!validDateFormats.includes(config.dateFormat)) {
        config.dateFormat = 'YYYY-MM-DD';
    }
    
    if (typeof config.includeDate !== 'boolean') {
        config.includeDate = false;
    }
    
    if (typeof config.template !== 'string' || config.template.length === 0) {
        config.template = '${version} ${message}';
    }
    
    return config;
}

function saveConfigurationSafely(config: any) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const configPath = path.join(workspaceRoot, '.git-version-commit.json');
    
    try {
        // Validate configuration
        const validatedConfig = validateConfig(config);
        
        // Safely write to file
        fs.writeFileSync(configPath, JSON.stringify(validatedConfig, null, 2), 'utf8');
        vscode.window.showInformationMessage('Configuration saved successfully!');
    } catch (error) {
        console.error('Failed to save configuration:', error);
        vscode.window.showErrorMessage(`Failed to save configuration: ${error}`);
    }
}

function loadConfigurationSafely(webview: vscode.Webview) {
    const config = loadConfigurationSafelyFromDisk();
    webview.postMessage({
        command: 'loadConfig',
        config: config
    });
}

export function deactivate() {}
