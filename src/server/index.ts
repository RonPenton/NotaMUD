import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as passportSocketIo from "passport.socketio";

// import * as passportsocketio from 'passport.socketio';

import secrets from './secrets';
import config from './config';
import routes from './routes';
import * as auth from './auth';
import { Message } from './messages';


const awsoptions = {
    table: 'notamud_sessions',
    AWSConfigJSON: {
        accessKeyId: secrets.AWSAccessKeyId,
        secretAccessKey: secrets.AWSSecretKey,
        region: config.AWSRegion
    },
    readCapacityUnits: 5,
    writeCapacityUnits: 5
};

const app = express();
auth.init();
const port = process.env.PORT || config.port;
app.set("port", port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var DynamoDBStore = require('connect-dynamodb')({ session: session });
var dynamodb = new DynamoDBStore(awsoptions);
app.use(session({ store: dynamodb, secret: secrets.cookieSecret, resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);


const server = http.createServer(app);
const io = socketio(server, { transports: ["websocket"] });
server.listen(port, () => console.log(`Listening on port ${port}...`))

io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'connect.sid',
    secret: secrets.cookieSecret,
    store: dynamodb
    // success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
    // fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));


function sendMessage(socket: SocketIO.Socket, message: Message) {
    const { type, ...rest } = message;
    socket.emit( type, {... rest});
}

io.on('connection', function (socket) {
    console.log("connected");
    var req: express.Request = socket.request;

    if(req.isUnauthenticated()) {
        sendMessage(socket, { type: 'access-denied' });
        socket.disconnect(true);
        return;
    }

    socket.on('disconnect', function () {
        console.log("disconnected");
    });
});