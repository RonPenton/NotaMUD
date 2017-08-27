import * as moment from 'moment';

export interface User {
    name: string;
    passwordHash: string;
    created: moment.Moment;
    lastLogin: moment.Moment;
    suspendedUntil?: moment.Moment;
    suspensionReason?: string;
}

export default User;