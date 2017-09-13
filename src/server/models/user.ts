import * as moment from 'moment';

export interface User {
    name: string;
    displayName: string;
    passwordHash: string;
    created: moment.Moment;
    lastLogin: moment.Moment;
    suspendedUntil?: moment.Moment;
    suspensionReason?: string;
}

export const isInvalidName = (name: string) : boolean => {
    return name.match(/[^A-Za-z]/g) !== null;
}

export const getCanonicalName = (name: string) : string => {
    return name.toLowerCase();
}

export default User;