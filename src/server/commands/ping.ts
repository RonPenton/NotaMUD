import { Ping, TimeStamped } from '../messages';
import { constructCommand } from './index';

module.exports.commands = constructCommand<TimeStamped<Ping>>(
    "ping",
    "Pings the server to tell you your connection latency.",
    undefined,
    "ping",
    (message, user, world) => {
        world.sendToUser(user, { type: 'pong', originalStamp: message.timeStampStr });
    }
);