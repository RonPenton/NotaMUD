import { constructCommand } from './index';

module.exports.commands = constructCommand(
    "who",
    "Gives you a list of everyone who is currently logged into the realm.",
    (_command, _parameters, user, world) => {
        const users = world.getActiveUsers();
        world.sendToUser(user, { type: 'active-users', list: Array.from(users) });
    }
);
