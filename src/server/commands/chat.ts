import { split } from '../utils/parse';
import { getUserReference } from '../models/user';
import { constructCommand, truePromise } from './index';

module.exports.commands = [

    constructCommand(
        ["chat", "ch"],
        "Initiates a global chat command that will be seen by everyone on the server.",
        (_, parameters, user, world) => {
            world.sendToAll({ type: 'talk-global', from: getUserReference(user), message: parameters.trim() });
            return truePromise;
        }
    ),
    constructCommand(
        "say",
        "Speaks text to the people in your current location.",
        (_, parameters, user, world) => {
            world.say(user, parameters);
            return truePromise;
        }
    ),
    constructCommand(
        ["whisper", "wh"],
        "Sends a private communication to a person on the server.",
        (_, parameters, user, world) => {
            const { head, tail } = split(parameters);
            world.whisper(user, head, tail);
            return truePromise;
        }
    )
];