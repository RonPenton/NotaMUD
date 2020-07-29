import express from 'express';
import path from 'path';
import http from 'http';
import socketio from 'socket.io';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import flash = require('connect-flash');
import passportSocketIo from "passport.socketio";
import AWS from 'aws-sdk';

import secrets from './secrets';
import config, { dbconfig } from './config';
import { init as initRoutes } from './routes';
import * as auth from './auth';
import { World } from './models/world';
import * as NotamudUser from './models/user';

start();

async function start() {
    const port = process.env.PORT || config.Port;
    const world = await World.create();

    const { server, dynamodb } = setupExpress(port, world);
    setupSocketIO(server, port, dynamodb, world);
}

function setupSocketIO(server: http.Server, port: string | number, dynamodb: any, world: World) {
    const io = socketio(server, { transports: ["websocket"] });
    server.listen(port, () => console.log(`Listening on port ${port}...`))

    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        key: 'connect.sid',
        secret: secrets.cookieSecret,
        store: dynamodb
    }));

    io.on('connection', function (socket) {
        console.log("connected");
        const req: express.Request = socket.request;

        if (req.isUnauthenticated()) {
            // Probably not needed because the middleware prevents unauthorized connections
            // from getting this far. That being said, if the behavior ever changes, at least we're protected.
            if (socket) socket.emit('access-denied', {});
            socket.disconnect(true);
            return;
        }

        const user = req.user;

        if (!user)
            return;

        world.userConnecting(user, socket);

        socket.on('disconnect', function () {
            world.userDisconnecting(user);
            console.log("disconnected");
        });
    });
}


function setupExpress(port: string | number, world: World) {
    AWS.config.update(secrets.AWSConfig);
    const awsoptions = {
        table: dbconfig.session,
        AWSConfigJSON: secrets.AWSConfig,
        readCapacityUnits: config.AWSReadCapacityUnits,
        writeCapacityUnits: config.AWSWriteCapacityUnits
    };

    const app = express();
    auth.init(world);
    app.set("port", port);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(logger('dev'));
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    const DynamoDBStore = require('connect-dynamodb')({ session: session });
    const dynamodb = new DynamoDBStore(awsoptions);
    app.use(session({ store: dynamodb, secret: secrets.cookieSecret, resave: false, saveUninitialized: false }));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(auth.catchAuthErrorsMiddleware);

    app.use(initRoutes(world));

    const server = http.createServer(app);

    return { server, dynamodb };
}


declare global {
    namespace Express {
        interface User extends NotamudUser.User {

        }
    }
}
