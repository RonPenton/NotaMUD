import { DirectionNames, DirectionsOrdered } from '../models/direction';
import { Move, TimeStamped } from '../messages';
import { constructCommand } from './index';

module.exports.commands = [

    constructCommand<TimeStamped<Move>>({
        keywords: "",
        helptext: "",
        messageName: "move",
        executeMessage: ({ message, user, world }) => {
            world.move(user, message.direction);
        }
    }),
    ...DirectionsOrdered.select(direction => {
        const fullName = DirectionNames.get(direction)!;
        return constructCommand<TimeStamped<Move>>({
            keywords: [direction, fullName],
            helptext: `Moves you in the ${fullName} direction.`,
            execute: ({ user, world }) => {
                world.move(user, direction);
            }
        })
    }).toArray()
];
