import { constructCommand } from './index';

module.exports.commands = constructCommand({
    keywords: "help",
    helptext: "hives you help about commands available in the system.",
    execute: ({ user, world }) => {
        const commands = Array.from(world.getCommands());
        world.sendToUser(user, { type: 'help', commands });
    }
});
