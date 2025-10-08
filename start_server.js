const express = require('express');
const { spawn, execSync } = require('child_process');
const path = require('path');
const cors = require('cors');
const net = require('net');

const app = express();
let flaskProcess = null;
let PORT = 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.options('*', cors());

function findAvailablePort(startPort, callback) {
    const server = net.createServer();
    server.listen(startPort, () => {
        server.once('close', () => callback(startPort));
        server.close();
    });
    server.on('error', () => {
        findAvailablePort(startPort + 1, callback);
    });
}

app.get('/start-server', (req, res) => {
    if (flaskProcess) {
        return res.json({ status: 'success', message: 'Flask server already running' });
    }

    try {
        const serverPath = path.join(__dirname, 'server.py');
        if (!require('fs').existsSync(serverPath)) {
            throw new Error('server.py not found in project directory');
        }

        flaskProcess = spawn('python', [serverPath], {
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        flaskProcess.stdout.on('data', (data) => {
            console.log(`Flask stdout: ${data}`);
        });

        flaskProcess.stderr.on('data', (data) => {
            console.error(`Flask stderr: ${data}`);
        });

        flaskProcess.on('close', (code) => {
            console.log(`Flask process exited with code ${code}`);
            flaskProcess = null;
        });

        setTimeout(() => {
            res.json({ status: 'success', message: 'Flask server started' });
        }, 2000);
    } catch (error) {
        console.error(`Error starting Flask server: ${error}`);
        res.status(500).json({ status: 'error', message: `Failed to start Flask server: ${error.message}` });
    }
});

app.get('/stop-server', (req, res) => {
    if (!flaskProcess) {
        return res.json({ status: 'success', message: 'Flask server not running' });
    }

    try {
        execSync(`taskkill /PID ${flaskProcess.pid} /T /F`);
        flaskProcess = null;
        res.json({ status: 'success', message: 'Flask server stopped' });
    } catch (error) {
        console.error(`Error stopping Flask server: ${error}`);
        res.status(500).json({ status: 'error', message: `Failed to stop Flask server: ${error.message}` });
    }
});

app.get('/get-port', (req, res) => {
    res.json({ port: PORT });
});

findAvailablePort(PORT, (availablePort) => {
    PORT = availablePort;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Node.js server running on http://127.0.0.1:${PORT}`);
    });
});