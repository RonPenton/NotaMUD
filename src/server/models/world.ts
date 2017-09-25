import { getArray } from '../utils/index';
import { Direction } from './direction';
import { TimedMessage, TimeStamp } from '../messages';
import { split } from '../utils/parse';
import { config } from '../config';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';

import { Actor, findUserMatch, getActorReference, getCanonicalName, getUserReference, isUser, User } from './user';
import { isRoom, Room } from './room';
import { Scriptable } from "./scriptable";
import { Rooms, Actors } from "./db";
import { L } from '../utils/linq';
import * as Messages from '../messages';
import Message from '../messages';
import { isString } from 'util';
import { Command } from '../commands/index';


export class World implements Scriptable {

    static async create(): Promise<World> {
        const rooms = L(await Rooms.getAll())
            .select(x => { return { ...x, actors: new Set<Actor>() } })
            .toMap(x => x.id);
        const actors = L(await Actors.getAll()).toMap(x => x.id);

        const commands = await World.loadCommands();

        return new World(rooms, actors, commands);
    }

    private constructor(
        private readonly rooms: Map<number, Room>,
        public readonly actors: Map<number, Actor>,
        private readonly commands: Command[]) {

        const users = L(actors.values()).where(x => isUser(x)).toArray() as User[];
        this.users = L(users).toMap(u => u.uniquename);
    }

    private readonly users = new Map<string, User>();
    private nextActorId: number = 0;
    public getNextActorId(): number { return this.nextActorId++; }

    private activeUsers = new Map<string, User>();
    private userSockets = new Map<string, SocketIO.Socket>();

    public getActiveUsers(): Iterable<User> { return this.activeUsers.values(); }
    public getUser(name: string) { return this.users.get(getCanonicalName(name)); }
    public getCommands(): Iterable<Command> { return this.commands }

    public data: { [index: string]: any } = [];

    public userCreated(user: User) {
        if (this.users.has(user.uniquename))
            throw new Error("Cannot add user to world, username taken.");

        this.users.set(user.uniquename, user);
    }

    public userDisconnecting(user: User) {
        const active = this.activeUsers.get(user.uniquename)
        if (active) {
            this.activeUsers.delete(user.uniquename);
            this.userSockets.delete(user.uniquename);
            this.leaveRoom(user);
            this.sendToAll({ type: 'disconnected', from: getUserReference(user) });
        }
    }

    public userConnecting(user: User, socket: SocketIO.Socket) {
        if (this.activeUsers.has(user.uniquename)) {
            const oldSocket = this.userSockets.get(user.uniquename);
            this.activeUsers.delete(user.uniquename);
            this.userSockets.delete(user.uniquename);
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
        this.activeUsers.set(user.uniquename, user);
        this.userSockets.set(user.uniquename, socket);

        this.sendToAll({ type: 'connected', from: getUserReference(user) });
        this.sendToUser(socket, { type: 'system', message: config.WelcomeMessage });
        this.enteredRoom(user);

        socket.on('message', (message: TimedMessage) => this.handleMessage(user, message))
    }

    public sendToUser(username: string, message: Message): void;
    public sendToUser(socket: SocketIO.Socket, message: Message): void;
    public sendToUser(user: User, message: Message): void;
    public sendToUser(socketOrUser: SocketIO.Socket | string | User, message: Message) {
        const socket = isString(socketOrUser)
            ? this.userSockets.get(socketOrUser)
            : isUser(socketOrUser) ?
                this.userSockets.get(socketOrUser.uniquename)
                : socketOrUser;
        if (socket) {
            socket.emit('message', TimeStamp(message));
        }
    }

    public sendToAll(message: Message) {
        const users = this.userSockets.keys();
        for (let name of users) {
            this.sendToUser(name, message);
        }
    }

    private sendToRoom(room: Room, message: Message): void;
    private sendToRoom(actor: Actor, message: Message): void;
    private sendToRoom(roomOrActor: Room | Actor, message: Message): void {
        const room = isRoom(roomOrActor) ? roomOrActor : this.rooms.get(roomOrActor.roomid);
        if (!room) return;

        const users = L(room.actors).where(x => isUser(x)).toArray() as User[];
        for (let user of users) {
            this.sendToUser(user, message);
        }
    }

    private async handleMessage(user: User, message: TimedMessage) {

        for (let command of this.commands) {
            const handled = await command.executeMessage(message, user, this);
            if (handled) return;
        }

        if (message.type == 'text-command') {
            const { head, tail } = split(message.message);
            for (let command of this.commands) {
                const handled = await command.execute(head, tail, user, this);
                if (handled) return;
            }

            // no commands picked up, default to talking. 
            this.say(user, message.message);
        }
    }

    public say(actor: Actor, message: string) {
        this.sendToRoom(actor, { type: 'talk-room', from: getActorReference(actor), message })
    }

    public whisper(user: User, targetName: string, message: string) {
        const target = findUserMatch(targetName, L(this.activeUsers.values()).toArray());
        if (!target)
            return this.sendToUser(user, { type: 'error', message: 'There is no user with that name!' });
        if (target.id == user.id)
            return this.sendToUser(user, { type: 'system', message: 'You mutter to yourself...' });
        this.sendToUser(user, { type: 'system', message: `You whisper to ${target.name}...` });
        this.sendToUser(target, { type: 'talk-private', from: getUserReference(user), message: message });
    }

    public look(user: User, message: Messages.Look) {
        if (message.subject) {
            //TODO
            return;
        }
        this.sendRoomDescription(user, message.brief);
    }

    public move(user: User, direction: Direction) {
        const oldRoom = this.rooms.get(user.roomid);
        if (!oldRoom) return;
        const exit = oldRoom.exits[direction];
        if (!exit)
            return this.sendToUser(user, { type: 'error', message: "There is no exit in that direction!" });

        const newRoom = this.rooms.get(exit.exitroom);
        if (!newRoom) return;

        this.leaveRoom(user, direction);
        user.roomid = newRoom.id;
        this.enteredRoom(user, direction);
    }

    private sendRoomDescription(user: User, brief?: boolean, room?: Room) {
        const r = room || this.rooms.get(user.roomid);
        if (!r) {
            console.log("Error: Could not find room user is in");
            //TODO: eventually log this better.
            return; // who knows.
        }

        this.sendToUser(user, {
            type: 'room-description',
            id: r.id,
            name: r.name,
            description: brief ? undefined : r.description,
            exits: r.exits,
            actors: L(r.actors.values()).select(x => getActorReference(x)).toArray(),
            inRoom: r.id == user.roomid
        });
    }

    private leaveRoom(actor: Actor, direction?: Direction) {
        const room = this.rooms.get(actor.roomid);
        if (!room)
            return;

        this.sendToRoom(room, { type: 'actor-moved', from: getActorReference(actor), entered: false, direction: direction });
        room.actors.delete(actor);
    }

    private enteredRoom(actor: Actor, direction?: Direction) {
        const room = this.rooms.get(actor.roomid);
        if (!room)
            return;

        this.sendToRoom(room, { type: 'actor-moved', from: getActorReference(actor), entered: true, direction: direction });
        room.actors.add(actor);

        if (isUser(actor)) {
            this.sendRoomDescription(actor);
        }
    }

    private static loadCommands(): Promise<Command[]> {
        const p = path.resolve(__dirname, '..', 'commands');
        return new Promise<Command[]>((resolve, reject) => {
            fs.readdir(p, (error, files) => {
                if (error) return reject(error);
                const commands: Command[] = [];
                for (let f of L(files).where(x => x.endsWith(".js"))) {
                    const imports = require("../commands/" + f).commands;
                    if (!imports) continue;
                    for (let c of getArray(imports)) {
                        commands.push(c);
                    }
                }
                resolve(commands);
            });
        });
    }
}