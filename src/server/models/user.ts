import { L } from '../utils/linq';
import * as moment from 'moment';

export interface Actor {
    id: number;
    name: string;
    roomid: number;
}

export type ActorReference = {
    name: string;
    id: number;
}

export const getActorReference = (actor: Actor): ActorReference => {
    return {
        name: actor.name,
        id: actor.id
    }
}

export type User = {
    uniquename: string;
    passwordHash: string;
    created: moment.Moment;
    lastLogin: moment.Moment;
    suspendedUntil?: moment.Moment;
    suspensionReason?: string;
} & Actor;

export type UserReference = ActorReference & {
    uniquename: string;
}

export const getUserReference = (user: User): UserReference => {
    return { ...getActorReference(user), uniquename: user.uniquename };
}

export const isUser = (actor: Actor | SocketIO.Socket): actor is User => {
    if ((<User>actor).uniquename)
        return true;
    return false;
}

export const isInvalidName = (name: string): boolean => {
    return name.match(/[^A-Za-z]/g) !== null;
}

export const getCanonicalName = (name: string): string => {
    return name.toLowerCase();
}

export const findUserMatch = (partialName: string, users: User[]) => {
    const partial = getCanonicalName(partialName);
    const u = L(users);
    return u.firstOrDefault(x => x.uniquename == partial)           // match exact names first.
        || u.firstOrDefault(x => x.uniquename.startsWith(partial)); // then partials if none found.
}

export default User;