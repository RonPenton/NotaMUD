import { CommandReference } from './commands/index';
import * as moment from 'moment';

import { RoomClientData } from './models/room';
import { Direction } from './models/direction';
import { ActorReference, UserReference } from './models/user';

export type TypedMessage<T extends string> = { type: T };
export type GenericMessage<T extends string> = TypedMessage<T> & { message: string; }
export type NullMessage = TypedMessage<'null'>;

export type TimeStamped<T> = T & { timeStampStr: string };
export type TimedMessage = TimeStamped<Message>;
export function TimeStamp(message: Message): TimedMessage {
    return { ...message, timeStampStr: moment().toISOString() }
}

export type FromActor = { from: ActorReference };
export type FromUser = { from: UserReference };
export type ToActor = { to: ActorReference };

export type Error = GenericMessage<'error'>;
export type System = GenericMessage<'system'>;
export type Debug = GenericMessage<'debug'>;
export type TextCommand = GenericMessage<'text-command'>;
export type Connected = TypedMessage<'connected'> & FromUser;
export type Disconnected = TypedMessage<'disconnected'> & FromUser;

export type TalkGlobal = GenericMessage<'talk-global'> & FromUser;
export type TalkRoom = GenericMessage<'talk-room'> & FromActor;
export type TalkPrivate = GenericMessage<'talk-private'> & FromUser;

export type Ping = TypedMessage<'ping'>;
export type Pong = TypedMessage<'pong'> & { originalStamp: string };

export type Look = TypedMessage<'look'> & { brief?: boolean, subject?: string };
export type RoomDescription = TypedMessage<'room-description'> & RoomClientData & { inRoom: boolean };
export type Move = TypedMessage<'move'> & { direction: Direction };
export type ActorMoved = TypedMessage<'actor-moved'> & FromActor & { entered: boolean, direction?: Direction };

export type ActiveUsers = TypedMessage<'active-users'> & { list: UserReference[] };
export type Help = TypedMessage<'help'> & { commands: CommandReference[] };

export type Message =
    NullMessage |
    Error | System | Debug |
    TextCommand |
    Connected | Disconnected |
    TalkGlobal | TalkRoom | TalkPrivate |
    Ping | Pong |
    Look | RoomDescription |
    Move | ActorMoved |
    ActiveUsers |
    Help;


    
export default Message;





