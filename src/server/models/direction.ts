import { tuple } from '../utils/index';
import { Exit, RoomBaseData } from './room';
import { L } from "../utils/linq";

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

export const DirectionOpposites = new Map<Direction, Direction>([
    ["n", "s"],
    ["ne", "sw"],
    ["e", "w"],
    ["se", "nw"],
    ["s", "n"],
    ["sw", "ne"],
    ["w", "e"],
    ["nw", "se"],
    ["u", "d"],
    ["d", "u"]
]);

export const getLeavingPhrase = (direction: Direction) => {
    switch(direction) {
        case "u": return "upwards";
        case "d": return "downwards";
    }
    return `to the ${DirectionNames.get(direction)}`;
}

export const getEnteringPhrase = (direction: Direction) => {
    switch(direction) {
        case "u": return "from above";
        case "d": return "from below";
    }
    return `from the ${DirectionNames.get(direction)}`;
}

export const getDirectionOpposite = (direction: Direction) => {
    return DirectionOpposites.get(direction)!;
}

export const getDirection = (str: string) => {
    return DirectionsOrdered.firstOrDefault(x => x == str || DirectionNames.get(x) == str);
}

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

export const getDirectionsInOrder = (room: RoomBaseData): Iterable<[Direction, Exit]> => {
    return DirectionsOrdered.select(d => tuple(d, room.exits[d])).where(e => e[1] != undefined) as Iterable<[Direction, Exit]>;
}