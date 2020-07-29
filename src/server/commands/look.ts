import { Look, TimeStamped } from '../messages';
import { constructCommand } from './index';

module.exports.commands = constructCommand<TimeStamped<Look>>({
    keywords: "look",
    helptext: "Looks at your surroundings. Look at an exit, item, or person for more details.",
    messageName: "look",
    executeMessage: ({ message, user, world }) => {
        world.look(user, message);
    }
});
