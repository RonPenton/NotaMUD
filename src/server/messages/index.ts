export type AccessDenied = {
    type: 'access-denied';
}

export type Error = {
    type: 'error-message';
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

export type Message =
    AccessDenied |
    Error |
    Connected |
    Disconnected |
    System;