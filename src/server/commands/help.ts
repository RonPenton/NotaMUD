import { constructCommand } from './index';

module.exports.commands = constructCommand(
    "help",
    "hives you help about commands available in the system.",
    (_command, _parameters, user, world) => {
        const commands = Array.from(world.getCommands());
        world.sendToUser(user, { type: 'help', commands });
    }
);
