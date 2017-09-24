import { split } from '../utils/parse';
import { getUserReference } from '../models/user';
import { constructCommand } from './index';

module.exports.commands = [

    constructCommand(
        ["chat", "ch"],
        "Initiates a global chat command that will be seen by everyone on the server.",
        (_command, parameters, user, world) => {
            world.sendToAll({ type: 'talk-global', from: getUserReference(user), message: parameters.trim() });
        }
    ),
    constructCommand(
        "say",
        "Speaks text to the people in your current location.",
        (_command, parameters, user, world) => {
            world.say(user, parameters);
        }
    ),
    constructCommand(
        ["whisper", "wh"],
        "Sends a private communication to a person on the server.",
        (_command, parameters, user, world) => {
            const { head, tail } = split(parameters);
            world.whisper(user, head, tail);
        }
    )
];