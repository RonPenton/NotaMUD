import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import flash = require('connect-flash');
import * as passportSocketIo from "passport.socketio";
import * as AWS from 'aws-sdk';

import secrets from './secrets';
import config, { dbconfig } from './config';
import routes from './routes';
import * as auth from './auth';
import { World } from './models/world';

AWS.config.update(secrets.AWSConfig);
const awsoptions = {
    table: dbconfig.session,
    AWSConfigJSON: secrets.AWSConfig,
    readCapacityUnits: config.AWSReadCapacityUnits,
    writeCapacityUnits: config.AWSWriteCapacityUnits
};

const app = express();
auth.init();
const port = process.env.PORT || config.Port;
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

app.use(routes);


const server = http.createServer(app);
const io = socketio(server, { transports: ["websocket"] });
server.listen(port, () => console.log(`Listening on port ${port}...`))

io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'connect.sid',
    secret: secrets.cookieSecret,
    store: dynamodb
}));

start();


async function start() {

    const world = await World.create();

    io.on('connection', function (socket) {
        console.log("connected");
        const req: express.Request = socket.request;

        if (req.isUnauthenticated()) {
            // Probably not needed because the middleware prevents unauthorized connections
            // from getting this far. That being said, if the behavior ever changes, at least we're protected.
            if (socket) 
                socket.emit('access-denied', {});
            }
            socket.disconnect(true);
            return;
        }
        const user = req.user;

        world.userConnecting(user, socket);

        socket.on('disconnect', function () {
            world.userDisconnecting(user);
            console.log("disconnected");
        });
    });
}

