import { Look, TimeStamped } from '../messages/index';
import { constructCommand, truePromise } from './index';

module.exports.commands = constructCommand<TimeStamped<Look>>(
    "look",
    "Looks at your surroundings. Look at an exit, item, or person for more details.",
    undefined,
    "look",
    (message, user, world) => {
        world.look(user, message);
        return truePromise;
    }
);