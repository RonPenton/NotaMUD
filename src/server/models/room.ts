import { L } from "../utils/linq";
import { tuple } from "../utils/index";
import { Scriptable } from "./scriptable";


export type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw" | "u" | "d";
export type LongDirection = "north" | "northeast" | "east" | "southeast" | "south" | "southwest" | "west" | "northwest" | "up" | "down";
export const DirectionsOrdered = L(["n", "ne", "e", "se", "s", "sw", "w", "nw", "u", "d"] as Direction[]);

export const DirectionNames = new Map<Direction, LongDirection>([
    ["n", "north"],
    ["ne", "northeast"],
    ["e", "east"],
    ["se", "southeast"],
    ["s", "south"],
    ["sw", "southwest"],
    ["w", "west"],
    ["nw", "northwest"],
    ["u", "up"],
    ["d", "down"]
]);

const _directionKeys = L(DirectionNames.keys());
const _reversed = _directionKeys.select(x => tuple(DirectionNames.get(x)!, x));
export const DirectionValues = new Map<LongDirection, Direction>(_reversed);
const _longDirectionKeys = L(DirectionValues.keys());

export function isDirection(item: any): item is Direction {
    if (_directionKeys.areAny(x => x === item))
        return true;
    return false;
}

export function isLongDirection(item: any): item is LongDirection {
    if (_longDirectionKeys.areAny(x => x === item))
        return true;
    return false;
}

export interface Exit {
    exitroom: number;
}

export type Room = {
    id: number;
    name: string;
    description: string;
    exits: {[index in Direction]?: Exit }
} & Scriptable;

export const getDirectionsInOrder = (room: Room): Iterable<[Direction, Exit]> => {
    return DirectionsOrdered.select(d => tuple(d, room.exits[d])).where(e => e[1] != undefined) as Iterable<[Direction, Exit]>;
}