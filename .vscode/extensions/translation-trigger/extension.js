const vscode = require('vscode');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

function activate(context) {
    console.log('Translation Trigger extension activated');
    let port = 5505;

    // Create HTTP server
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'POST' && req.url === '/run-translation') {
            try {
                fs.writeFileSync('translation_progress.json', JSON.stringify({
                    progress: 0,
                    logs: [],
                    status: 'idle',
                    message: ''
                }, null, 2), 'utf8');
                const pythonProcess = spawn('python', ['Trans.py'], {
                    cwd: vscode.workspace.workspaceFolders[0].uri.fsPath,
                    stdio: ['ignore', 'pipe', 'pipe']
                });
                pythonProcess.stdout.on('data', (data) => {
                    console.log(`Trans.py stdout: ${data}`);
                });
                pythonProcess.stderr.on('data', (data) => {
                    console.error(`Trans.py stderr: ${data}`);
                });
                pythonProcess.on('close', (code) => {
                    console.log(`Trans.py exited with code ${code}`);
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', message: 'Translation started' }));
            } catch (error) {
                console.error(`Failed to start translation: ${error}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: `Failed to start translation: ${error.message}` }));
            }
        } else if (req.method === 'GET' && req.url === '/get-port') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ port }));
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(port, '127.0.0.1', () => {
        console.log(`Translation trigger server running at http://127.0.0.1:${port}`);
    });

    let disposable = vscode.commands.registerCommand('nbi-green-economy.runTranslation', () => {
        vscode.window.showInformationMessage('Running translation...');
        const pythonProcess = spawn('python', ['Trans.py'], {
            cwd: vscode.workspace.workspaceFolders[0].uri.fsPath
        });
        pythonProcess.on('close', (code) => {
            vscode.window.showInformationMessage(`Translation completed with code ${code}`);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {
    console.log('Translation Trigger extension deactivated');
}

module.exports = {
    activate,
    deactivate
};