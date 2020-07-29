import React from 'react';
import { ErrorComponent } from './error';
import { GameContext } from '../App';
import { Message, TimeStamped } from '../../server/messages';
import moment from 'moment';

export type ExecuteFunction<T extends Message> = (message: T, context: GameContext) => (Promise<boolean> | void);
export type ExecuteFunctionPromise<T extends Message> = (message: T, context: GameContext) => Promise<boolean>;

export type Command<T extends Message = Message> = {
    name: string,
    execute: ExecuteFunction<T>
}

export type Commands = Map<string, Command>;
const commands = new Map<string, Command>();
export function install(command: Command) {
    commands.set(command.name, command);
}

export type InstallFunction = (command: Command) => void;
export type CreateFunction = (install: InstallFunction) => void;

export function create<T extends Message>(name: string, execute: ExecuteFunction<T>): Command<T> {
    return { name, execute };
}

export function handle(message: TimeStamped<Message>, context: GameContext) {
    const command = commands.get(message.type);
    if (!command) {
        const error = `Message not supported: ${message.type}`;
        context.addOutput(<ErrorComponent>{error}</ErrorComponent>)
        return;
    }

    command.execute(message, context);
}

export type ShowTimestamp = { time?: string };
export const TimeStamp: React.SFC<ShowTimestamp> = props => {
    if (!props.time)
        return null;
    const time = moment(props.time);
    return <span className="timestamp">{`[${time.format('LT')}] `}</span>
}

export const Generic: React.SFC<ShowTimestamp> = (props) => {
    return <div className="message generic"><TimeStamp time={props.time} />{props.children}</div>
}
