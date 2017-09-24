import { DirectionNames, DirectionsOrdered } from '../models/direction';
import { Move, TimeStamped } from '../messages';
import { constructCommand } from './index';

module.exports.commands = [

    constructCommand<TimeStamped<Move>>(
        "",
        "",
        undefined,
        "move",
        (message, user, world) => {
            world.move(user, message.direction);
        }
    ),
    ...DirectionsOrdered.select(direction => {
        const fullName = DirectionNames.get(direction)!;
        return constructCommand<TimeStamped<Move>>(
            [direction, fullName],
            `Moves you in the ${fullName} direction.`,
            (_command, _parameters, user, world) => {
                world.move(user, direction);
            }
        )
    }).toArray()
];