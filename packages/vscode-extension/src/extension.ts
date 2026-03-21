import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CommitverCore } from '@commitver/core';

export function activate(context: vscode.ExtensionContext) {
    console.log('COMMITVER extension is now active!');

    // Register quick commit command
    let disposable = vscode.commands.registerCommand('commitver.quickCommit', () => {
        quickCommitWithVersion();
    });

    context.subscriptions.push(disposable);
}

async function quickCommitWithVersion() {
    try {
        // Check if we're in a git repository
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        // Get commit message from user
        const message = await vscode.window.showInputBox({
            prompt: 'Enter commit message',
            placeHolder: 'Your commit message...'
        });

        if (!message) {
            vscode.window.showInformationMessage('Commit cancelled');
            return;
        }

        // Initialize core
        const core = new CommitverCore();

        // Find package.json
        const packageJsonPath = findPackageJson(workspaceFolder.uri.fsPath);
        
        // Process commit message with version
        const result = await core.processCommitMessage(message, packageJsonPath || undefined);

        // Show result to user
        const action = await vscode.window.showInformationMessage(
            `Commit with version: ${result.formatted}`,
            'Commit', 'Cancel'
        );

        if (action === 'Commit') {
            await executeGitCommit(workspaceFolder.uri.fsPath, result.formatted);
            
            // Update package.json if found
            if (packageJsonPath) {
                await core.updatePackageVersion(packageJsonPath, result.version);
                vscode.window.showInformationMessage(
                    `✅ Committed: ${result.formatted}\n✅ Package version updated: ${result.version.major}.${result.version.minor}.${result.version.patch}`
                );
            } else {
                vscode.window.showInformationMessage(`✅ Committed: ${result.formatted}`);
            }
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${(error as Error).message}`);
    }
}

function findPackageJson(startDir: string): string | null {
    let currentDir = startDir;
    
    while (currentDir !== path.dirname(currentDir)) {
        const packageJsonPath = path.join(currentDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            return packageJsonPath;
        }
        currentDir = path.dirname(currentDir);
    }
    
    return null;
}

async function executeGitCommit(workspacePath: string, message: string): Promise<void> {
    const { exec } = require('child_process') as any;
    
    return new Promise((resolve, reject) => {
        exec('git add .', { cwd: workspacePath }, (error: any) => {
            if (error) {
                reject(error);
                return;
            }
            
            exec(`git commit -m "${message}"`, { cwd: workspacePath }, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    });
}

export function deactivate() {
    console.log('COMMITVER extension deactivated');
}
