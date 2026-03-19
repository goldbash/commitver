"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    console.log('COMMITVER extension is now active!');
    // Register simple commit command
    let disposable = vscode.commands.registerCommand('commitver.quickCommit', () => {
        quickCommitWithVersion();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
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
            return; // User cancelled
        }
        // Execute git commands
        const terminal = vscode.window.createTerminal({
            name: 'COMMITVER',
            cwd: workspaceFolder.uri.fsPath
        });
        terminal.show();
        terminal.sendText('git add .');
        terminal.sendText(`git commit -m "${message}"`);
        // Close terminal after a short delay
        setTimeout(() => {
            terminal.dispose();
        }, 3000);
        vscode.window.showInformationMessage('Commit with version completed!');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map