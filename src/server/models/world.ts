import * as moment from 'moment';

import { User } from "./user";
// import { Actor } from "./actor";
import { Room } from "./room";
import { Scriptable } from "./scriptable";
import { getAllRooms } from "./db";
import { L } from '../utils/linq';
import * as Messages from '../messages';
import { isString } from 'util';


export class World implements Scriptable {

    static async create(): Promise<World> {
        const rooms = L(await getAllRooms()).toMap(x => x.id);

        return new World(rooms);
    }

    private users = new Map<string, User>();
    private activeUsers = new Map<string, User>();
    private userSockets = new Map<string, SocketIO.Socket>();

    // private actors = new Map<number, Actor>();
    readonly rooms = new Map<number, Room>();

    public data: { [index: string]: any } = [];

    private constructor(rooms: Map<number, Room>) {
        this.rooms = rooms;
    }

    public userCreated(user: User) {
        if (this.users.has(user.name))
            throw new Error("Cannot add user to world, username taken.");

        this.users.set(user.name, user);
    }

    public userDisconnecting(user: User) {
        const active = this.activeUsers.get(user.name)
        if (active) {
            this.activeUsers.delete(user.name);
            this.userSockets.delete(user.name);
            this.sendToAll({ type: 'user-disconnected', name: user.name, displayName: user.displayName });
        }
    }

    public userConnecting(user: User, socket: SocketIO.Socket) {
        if (this.activeUsers.has(user.name)) {
            const oldSocket = this.userSockets.get(user.name);
            this.activeUsers.delete(user.name);
            this.userSockets.delete(user.name);
            if (oldSocket) {
                this.sendToUser(socket, { type: 'error', message: "You have been disconnected because a newer connection has logged on." });
                oldSocket.disconnect(true);
            }
        }

        if (user.suspendedUntil && user.suspendedUntil.isAfter(moment())) {
            const reason = user.suspensionReason || "No reason specified."
            this.sendToUser(socket, { type: 'error', message: `You have been suspended for: ${reason} until ${user.suspendedUntil.toLocaleString()}` });
            socket.disconnect(true);
            return;
        }

        this.sendToAll({ type: 'user-connected', name: user.name, displayName: user.displayName });

        user.lastLogin = moment();
        this.activeUsers.set(user.name, user);
        this.userSockets.set(user.name, socket);
    }

    private sendToUser(user: string, message: Messages.Message): void;
    private sendToUser(socket: SocketIO.Socket, message: Messages.Message): void;
    private sendToUser(socketOrUser: SocketIO.Socket | string, message: Messages.Message) {
        const socket = isString(socketOrUser) ? this.userSockets.get(socketOrUser) : socketOrUser;
        if (socket) {
            const { type, ...rest } = message;
            socket.emit(type, { ...rest });
        }
    }

    private sendToAll(message: Messages.Message) {
        const users = this.userSockets.keys();
        for (let name of users) {
            this.sendToUser(name, message);
        }
    }
}