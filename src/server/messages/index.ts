export type Error = {
    type: 'error';
    message: string;
}

export type Connected = {
    type: 'connected';
    name: string;
    displayName: string;
}

export type Disconnected = {
    type: 'disconnected';
    name: string;
    displayName: string;
}

export type System = {
    type: 'system';
    message: string;
}

export type TalkGlobal = {
    type: 'talk-global';
    from: string;
    fromDisplay: string;
    message: string;
}

export type ClientTextCommand = {
    type: 'client-command';
    message: string;
}

export type Message =
    Error |
    Connected |
    Disconnected |
    System |
    TalkGlobal |
    ClientTextCommand;

export default Message;