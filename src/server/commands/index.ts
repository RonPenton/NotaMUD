import { getArray, ItemOrArray } from '../utils/index';
import { Message, NullMessage, TimeStamped } from '../messages';
import { User } from '../models/user';
import { World } from '../models/world';
import { In } from '../utils/linq';

export type ExecuteParameters = {
    command: string;
    parameters: string;
    user: User;
    world: World;
}

export type ExecuteMessageParameters = {
    message: Message,
    user: User,
    world: World
};

export type ExecuteMessageParametersTyped<T extends Message> = {
    message: T,
    user: User,
    world: World
}

export type ExecuteFunction = (params: ExecuteParameters) => (Promise<boolean> | void);
export type ExecuteFunctionPromise = (params: ExecuteParameters) => Promise<boolean>;
export type ExecuteMessageFunction = (params: ExecuteMessageParameters) => Promise<boolean>;
export type ExecuteMessageFunctionTyped<T extends Message> = (params: ExecuteMessageParametersTyped<T>) => (Promise<boolean> | void);

export interface CommandReference {
    keywords: string[];
    helptext: string;
}

export interface Command extends CommandReference {
    execute: ExecuteFunctionPromise;
    executeMessage: ExecuteMessageFunction;
}

export const getCommandReference = (command: Command): CommandReference => {
    const { keywords, helptext } = command;
    return { keywords, helptext };
}

export const falsePromise = new Promise<boolean>(resolve => resolve(false));
export const truePromise = new Promise<boolean>(resolve => resolve(true));

export function constructCommand<T extends TimeStamped<Message> = TimeStamped<NullMessage>>(args: {
    keywords: ItemOrArray<string>,
    helptext: string,
    execute?: ExecuteFunction,
    messageName?: T['type'],
    executeMessage?: ExecuteMessageFunctionTyped<T>
}
): Command {
    const { keywords, helptext, execute, messageName, executeMessage } = args;
    const kw = getArray(keywords);
    return {
        keywords: kw,
        helptext,
        execute: (args) => {
            const { command } = args;
            if (!execute || !In(command, ...kw))
                return falsePromise;
            return execute(args) || truePromise;
        },
        executeMessage: (args) => {
            const { message } = args;
            if (!executeMessage || message.type != messageName) return falsePromise;
            return executeMessage(args as any) || truePromise;
        }
    }
}
