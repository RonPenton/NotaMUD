import * as moment from 'moment';
import { RoomClientData, Direction } from '../models/room';

export type BaseMessage<T extends string> = { type: T };
export type GenericMessage<T extends string> = BaseMessage<T> & { message: string; }
export type ConcerningUser = {
    uniquename: string;
    name: string;
}
export type ConcerningActor = {
    name: string;
    actorid: number;
}

type _TimeStamped = { timeStampStr: string };
export type TimeStamped<T> = T & _TimeStamped;
export type TimedMessage = Message & _TimeStamped;
export function TimeStamp(message: Message): TimedMessage {
    return { ...message, timeStampStr: moment().toISOString() }
}

export type Error = GenericMessage<'error'>;
export type System = GenericMessage<'system'>;
export type ClientTextCommand = GenericMessage<'client-command'>;
export type UserInput = GenericMessage<'user-input'>;
export type Connected = BaseMessage<'connected'> & ConcerningUser;
export type Disconnected = BaseMessage<'disconnected'> & ConcerningUser;

export type TalkGlobal = GenericMessage<'talk-global'> & ConcerningUser;
export type TalkRoom = GenericMessage<'talk-room'> & ConcerningActor;
export type TalkPrivate = GenericMessage<'talk-private'> & ConcerningUser;

export type Ping = BaseMessage<'ping'>;
export type Pong = BaseMessage<'pong'> & { originalStamp: string };


export type Look = BaseMessage<'look'> & { brief?: boolean, subject?: string };
export type RoomDescription = BaseMessage<'room-description'> & RoomClientData & { inRoom: boolean };
export type Move = BaseMessage<'move'> & { direction: Direction };
export type ActorMoved = BaseMessage<'actor-moved'> & ConcerningActor & { entered: boolean, direction?: Direction };

export type Message =
    Error |
    System |
    ClientTextCommand |
    UserInput |
    Connected |
    Disconnected |
    TalkGlobal | TalkRoom | TalkPrivate |
    Ping | Pong |
    Look | RoomDescription |
    Move | ActorMoved;

export default Message;