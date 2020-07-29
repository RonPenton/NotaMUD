import { Ping, TimeStamped } from '../messages';
import { constructCommand } from './index';

module.exports.commands = constructCommand<TimeStamped<Ping>>({
    keywords: "ping",
    helptext: "Pings the server to tell you your connection latency.",
    messageName: "ping",
    executeMessage: ({ message, user, world }) => {
        world.sendToUser(user, { type: 'pong', originalStamp: message.timeStampStr });
    }
});
