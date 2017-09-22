import { TimeStamp } from '../messages/index';
import { split } from '../utils/parse';
import { config } from '../config';
import * as moment from 'moment';

import { User } from "./user";
// import { Actor } from "./actor";
import { Room } from "./room";
import { Scriptable } from "./scriptable";
import { getAllRooms } from "./db";
import { In, L } from '../utils/linq';
import * as Messages from '../messages';
import Message from '../messages';
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
            this.sendToAll({ type: 'disconnected', name: user.name, displayName: user.displayName });
        }
    }

    public userConnecting(user: User, socket: SocketIO.Socket) {
        if (this.activeUsers.has(user.name)) {
            const oldSocket = this.userSockets.get(user.name);
            this.activeUsers.delete(user.name);
            this.userSockets.delete(user.name);
            if (oldSocket) {
                this.sendToUser(oldSocket, { type: 'error', message: "You have been disconnected because a newer connection has logged on." });
                this.sendToUser(socket, { type: 'error', message: "You are already connected in another window... disconnecting the other account..." });
                oldSocket.disconnect(true);
            }
        }

        if (user.suspendedUntil && user.suspendedUntil.isAfter(moment())) {
            const reason = user.suspensionReason || "No reason specified."
            this.sendToUser(socket, { type: 'error', message: `You have been suspended for: ${reason} until ${user.suspendedUntil.toLocaleString()}` });
            socket.disconnect(true);
            return;
        }

        user.lastLogin = moment();
        this.activeUsers.set(user.name, user);
        this.userSockets.set(user.name, socket);

        this.sendToAll({ type: 'connected', name: user.name, displayName: user.displayName });
        this.sendToUser(socket, { type: 'system', message: config.WelcomeMessage });

        socket.on('message', (message: Message) => this.handleMessage(user, socket, message))
    }

    private sendToUser(user: string, message: Message): void;
    private sendToUser(socket: SocketIO.Socket, message: Message): void;
    private sendToUser(socketOrUser: SocketIO.Socket | string, message: Message) {
        const socket = isString(socketOrUser) ? this.userSockets.get(socketOrUser) : socketOrUser;
        if (socket) {
            socket.emit('message', TimeStamp(message));
        }
    }

    private sendToAll(message: Message) {
        const users = this.userSockets.keys();
        for (let name of users) {
            this.sendToUser(name, TimeStamp(message));
        }
    }

    private handleMessage(user: User, socket: SocketIO.Socket, message: Message) {
        if(message.type == 'client-command') {
            this.parseMessage(user, socket, message);
        }
    }

    private parseMessage(user: User, _: SocketIO.Socket, message: Messages.ClientTextCommand) {
        const { head, tail } = split(message.message);
        const command = head.toLowerCase();

        if(In(command, "ch", "chat")) {
            this.sendToAll({ type: 'talk-global', from: user.name, fromDisplay: user.displayName, message: tail.trim()});
            return;
        }

    }
}