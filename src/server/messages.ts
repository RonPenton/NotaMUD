import * as moment from 'moment';

import { RoomClientData } from './models/room';
import { Direction } from './models/direction';
import { ActorReference, UserReference } from './models/user';

export type BaseMessage<T extends string> = { type: T };
export type GenericMessage<T extends string> = BaseMessage<T> & { message: string; }
export type NullMessage = BaseMessage<'null'>;

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
export type TextCommand = GenericMessage<'text-command'>;
export type Connected = BaseMessage<'connected'> & FromUser;
export type Disconnected = BaseMessage<'disconnected'> & FromUser;

export type TalkGlobal = GenericMessage<'talk-global'> & FromUser;
export type TalkRoom = GenericMessage<'talk-room'> & FromActor;
export type TalkPrivate = GenericMessage<'talk-private'> & FromUser;

export type Ping = BaseMessage<'ping'>;
export type Pong = BaseMessage<'pong'> & { originalStamp: string };

export type Look = BaseMessage<'look'> & { brief?: boolean, subject?: string };
export type RoomDescription = BaseMessage<'room-description'> & RoomClientData & { inRoom: boolean };
export type Move = BaseMessage<'move'> & { direction: Direction };
export type ActorMoved = BaseMessage<'actor-moved'> & FromActor & { entered: boolean, direction?: Direction };

export type ActiveUsers = BaseMessage<'active-users'> & { list: UserReference[] };

export type Message =
    NullMessage |
    Error | System |
    TextCommand |
    Connected |
    Disconnected |
    TalkGlobal | TalkRoom | TalkPrivate |
    Ping | Pong |
    Look | RoomDescription |
    Move | ActorMoved |
    ActiveUsers;


    
export default Message;





