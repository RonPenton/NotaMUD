import { Ping, TimeStamped } from '../messages/index';
import { constructCommand, truePromise } from './index';

module.exports.commands = constructCommand<TimeStamped<Ping>>(
    "ping",
    "Pings the server to tell you your connection latency.",
    undefined,
    "ping",
    (message, user, world) => {
        world.sendToUser(user, { type: 'pong', originalStamp: message.timeStampStr });
        return truePromise;
    }
);