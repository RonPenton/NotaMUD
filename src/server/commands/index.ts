import { getArray, ItemOrArray } from '../utils/index';
import { Message, NullMessage, TimeStamped } from '../messages/index';
import { User } from '../models/user';
import { World } from '../models/world';
import { In } from '../utils/linq';

export type ExecuteFunction = (command: string, parameters: string, user: User, world: World) => Promise<boolean>;
export type ExecuteMessageFunction = (message: Message, user: User, world: World) => Promise<boolean>;
export type ExecuteMessageFunctionTyped<T extends Message> = (message: T, user: User, world: World) => Promise<boolean>;

export interface Command {
    keywords: ItemOrArray<string>;
    helptext: string;
    execute: ExecuteFunction;
    executeMessage: ExecuteMessageFunction;
}

/** Fuck you, Brooke. */
export const falsePromise = new Promise<boolean>(resolve => resolve(false));
export const truePromise = new Promise<boolean>(resolve => resolve(true));

export function constructCommand<T extends TimeStamped<Message> = TimeStamped<NullMessage>>(
    keywords: ItemOrArray<string>,
    helptext: string,
    execute?: ExecuteFunction,
    messageName?: T['type'],
    executeMessage?: ExecuteMessageFunctionTyped<T>
): Command {
    return {
        keywords: keywords,
        helptext: helptext,
        execute: (command, parameters, user, world) => {
            if (!execute || !In(command, ...getArray(keywords)))
                return falsePromise;
            return execute(command, parameters, user, world);
        },
        executeMessage: (message: T, user, world) => {
            if (!executeMessage || message.type != messageName) return falsePromise;
            return executeMessage(message, user, world)
        }
    }
}