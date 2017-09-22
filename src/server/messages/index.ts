import * as moment from 'moment';

export type BaseMessage<T extends string> = { type: T };
export type GenericMessage<T extends string> = BaseMessage<T> & { message: string; }

export type Error = GenericMessage<'error'>;
export type System = GenericMessage<'system'>;
export type ClientTextCommand = GenericMessage<'client-command'>;
export type UserInput = GenericMessage<'user-input'>;

export type Connected = BaseMessage<'connected'> & {
    name: string;
    displayName: string;
}

export type Disconnected = BaseMessage<'disconnected'> & {
    name: string;
    displayName: string;
}

export type TalkGlobal = GenericMessage<'talk-global'> & {
    from: string;
    fromDisplay: string;
}

export type Message =
    Error |
    System |
    ClientTextCommand |
    UserInput |
    Connected |
    Disconnected |
    TalkGlobal;

type _TimeStamped = { timeStampStr: string };
export type TimeStamped<T> = T & _TimeStamped;
export type TimedMessage = Message & _TimeStamped;

export function TimeStamp(message: Message) : TimedMessage {
    return { ...message, timeStampStr: moment().toISOString() }
}

export default Message;