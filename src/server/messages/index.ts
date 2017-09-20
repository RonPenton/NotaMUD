export type AccessDenied = {
    type: 'access-denied';
}

export type ErrorMessage = {
    type: 'error';
    message: string;
}

export type UserConnected = {
    type: 'user-connected';
    name: string;
    displayName: string;
}

export type UserDisconnected = {
    type: 'user-disconnected';
    name: string;
    displayName: string;
}

export type System = {
    type: 'system';
    message: string;
}

export type Message =
    AccessDenied |
    ErrorMessage |
    UserConnected |
    UserDisconnected;