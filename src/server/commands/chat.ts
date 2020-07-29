import { split } from '../utils/parse';
import { getUserReference } from '../models/user';
import { constructCommand } from './index';

module.exports.commands = [

    constructCommand({
        keywords: ["chat", "ch"],
        helptext: "Initiates a global chat command that will be seen by everyone on the server.",
        execute: ({ parameters, user, world }) => {
            world.sendToAll({ type: 'talk-global', from: getUserReference(user), message: parameters.trim() });
        }
    }),
    constructCommand({
        keywords: "say",
        helptext: "Speaks text to the people in your current location.",
        execute: ({ parameters, user, world }) => {
            world.say(user, parameters);
        }
    }),
    constructCommand({
        keywords: ["whisper", "wh"],
        helptext: "Sends a private communication to a person on the server.",
        execute: ({ parameters, user, world }) => {
            const { head, tail } = split(parameters);
            world.whisper(user, head, tail);
        }
    })
];
