import { constructCommand } from './index';

module.exports.commands = constructCommand({
    keywords: "who",
    helptext: "Gives you a list of everyone who is currently logged into the realm.",
    execute: ({ user, world }) => {
        const users = world.getActiveUsers();
        world.sendToUser(user, { type: 'active-users', list: Array.from(users) });
    }
});
