import * as http from 'http';
import * as fs from 'fs';
import { ServerConfig } from './config';

const cfg = JSON.parse(fs.readFileSync('./config/config.json', { encoding: "UTF8" })) as ServerConfig;

function readAndSendFile(filename: string, type: string, res: http.ServerResponse) {
    fs.readFile('./public' + filename, function (err, data) {
        if (err) {
            throw err;
        }

        res.writeHead(200, {'Content-Type': type});
        res.write(data);
        res.end();
    });
}

const server = http.createServer(function (req, res) {
	if (req.url === '/') {
		if (req.url === '/') {
			req.url = '/index.html';
		}
        readAndSendFile(req.url, 'text/html', res);
    } 
    else if (req.url === '/styles.css') {
        readAndSendFile('/css/styles.css', 'text/css', res);
    } 
    else if (req.url === '/client.js') {
        readAndSendFile('/client.js', 'text/javascript', res);
    } 
});

import * as socketio from 'socket.io';

const io = socketio(server, {
	transports: ['websocket']
});


