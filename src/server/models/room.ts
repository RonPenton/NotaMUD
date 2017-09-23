import { Direction } from './direction';
import { Scriptable } from "./scriptable";
import { Actor } from "./user";

export interface Exit {
    exitroom: number;
}

export type RoomBaseData = {
    id: number;
    name: string;
    exits: {[index in Direction]?: Exit };
    description?: string;
}

export const isRoom = (item: Room | Actor): item is Room => {
    if ((<Room>item).exits)
        return true;
    return false;
}

export type RoomClientData = RoomBaseData & {

}

export type DBRoom = RoomBaseData & {
    description: string;
} & Scriptable;

export type Room = DBRoom & {
    actors: Set<Actor>;
}
