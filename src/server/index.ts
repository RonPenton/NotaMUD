import * as http from 'http';
import * as fs from 'fs';
import * as socketio from 'socket.io';
import { ServerConfig } from './config';

const cfg = JSON.parse(fs.readFileSync('./build/config/config.json', { encoding: "UTF8" })) as ServerConfig;

function readAndSendFile(filename: string, type: string, res: http.ServerResponse) {
    fs.readFile('./build/public' + filename, function (err, data) {
        if (err) {
            throw err;
        }

        res.writeHead(200, { 'Content-Type': type });
        res.write(data);
        res.end();
    });
}

const server = http.createServer(function (req, res) {
    console.log(req.url);
    if (req.url === '/') {
        if (req.url === '/') {
            req.url = '/index.html';
        }
        readAndSendFile(req.url, 'text/html', res);
        return;
    }
    else if (req.url === '/styles.css') {
        readAndSendFile('/css/styles.css', 'text/css', res);
        return;
    }
    else if (req.url === '/client.js') {
        readAndSendFile('/client.js', 'text/javascript', res);
        return;
    }

    res.writeHead(404);
    res.end();
});


const io = socketio(server, {
    transports: ['websocket']
});

const port = process.env.PORT || cfg.port;
server.listen(port);
console.log(`Listening on port ${port}...`)

io.on('connection', function () {

});

