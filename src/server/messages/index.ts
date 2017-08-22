export type AccessDeniedMessage = {
    type: 'access-denied';
}

export type ErrorMessage = {
    type: 'error';
    message: string;
}


export type Message = AccessDeniedMessage | ErrorMessage;