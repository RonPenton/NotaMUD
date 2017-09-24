import { DirectionNames, DirectionsOrdered } from '../models/direction';
import { Move, TimeStamped } from '../messages/index';
import { constructCommand, truePromise } from './index';

module.exports.commands = [

    constructCommand<TimeStamped<Move>>(
        "",
        "",
        undefined,
        "move",
        (message, user, world) => {
            world.move(user, message.direction);
            return truePromise;
        }
    ),
    ...DirectionsOrdered.select(direction => {
        const fullName = DirectionNames.get(direction)!;
        return constructCommand<TimeStamped<Move>>(
            [direction, fullName],
            `Moves you in the ${fullName} direction.`,
            (_, __, user, world) => {
                world.move(user, direction);
                return truePromise;
            }
        )
    }).toArray()
];