import { L } from '../utils/linq';
import * as moment from 'moment';

export interface Actor {
    id: number;
    name: string;
    roomid: number;
}

export type ActorReference = {
    actorname: string;
    actorid: number;
}

export const getActorReference = (actor: Actor): ActorReference => {
    return {
        actorname: actor.name,
        actorid: actor.id
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

export const isUser = (actor: Actor): actor is User => {
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