import { Direction, getDirection } from './direction';
import { TimedMessage, TimeStamp } from '../messages/index';
import { split } from '../utils/parse';
import { config } from '../config';
import * as moment from 'moment';

import { Actor, getActorReference, getCanonicalName, isUser, User } from './user';
import { isRoom, Room } from './room';
import { Scriptable } from "./scriptable";
import { Rooms, Actors } from "./db";
import { In, L } from '../utils/linq';
import * as Messages from '../messages';
import Message from '../messages';
import { isString } from 'util';


export class World implements Scriptable {

    static async create(): Promise<World> {
        const rooms = L(await Rooms.getAll())
            .select(x => { return { ...x, actors: new Set<Actor>() } })
            .toMap(x => x.id);
        const actors = L(await Actors.getAll()).toMap(x => x.id);

        return new World(rooms, actors);
    }

    private constructor(
        private readonly rooms: Map<number, Room>,
        public readonly actors: Map<number, Actor>) {

        const users = L(actors.values()).where(x => isUser(x)).toArray() as User[];
        this.users = L(users).toMap(u => u.uniquename);
    }

    private readonly users = new Map<string, User>();
    private nextActorId: number = 0;
    public getNextActorId(): number { return this.nextActorId++; }

    private activeUsers = new Map<string, User>();
    private userSockets = new Map<string, SocketIO.Socket>();

    public getUser(name: string): User | undefined {
        return this.users.get(getCanonicalName(name));
    }

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
            this.sendToAll({ type: 'disconnected', uniquename: user.uniquename, name: user.name });
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

        this.sendToAll({ type: 'connected', uniquename: user.uniquename, name: user.name });
        this.sendToUser(socket, { type: 'system', message: config.WelcomeMessage });
        this.enteredRoom(user);

        socket.on('message', (message: TimedMessage) => this.handleMessage(user, socket, message))
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
            this.sendToUser(user.uniquename, message);
        }
    }

    private handleMessage(user: User, socket: SocketIO.Socket, message: TimedMessage) {
        switch (message.type) {
            case 'client-command':
                this.parseMessage(user, socket, message);
                return;
            case 'ping':
                this.sendToUser(socket, { type: 'pong', originalStamp: message.timeStampStr });
                return;
            case 'look':
                return this.look(user, message);
            case 'move':
                return this.move(user, message.direction);
        }
    }

    private parseMessage(user: User, _: SocketIO.Socket, message: Messages.ClientTextCommand) {
        const { head, tail } = split(message.message);
        const command = head.toLowerCase();

        const direction = getDirection(command);
        if(direction) {
            return this.move(user, direction);
        }

        if (In(command, "ch", "chat")) {
            this.sendToAll({ type: 'talk-global', uniquename: user.uniquename, name: user.name, message: tail.trim() });
            return;
        }

        if (In(command, "say")) {
            return this.say(user, tail);
        }

        // no commands picked up, default to talking. 
        this.say(user, message.message);
    }

    private say(actor: Actor, message: string) {
        this.sendToRoom(actor, { type: 'talk-room', actorname: actor.name, actorid: actor.id, message })
    }

    private look(user: User, message: Messages.Look) {
        if (message.subject) {
            //TODO
            return;
        }
        this.sendRoomDescription(user, message.brief);
    }

    private move(user: User, direction: Direction) {
        const oldRoom = this.rooms.get(user.roomid);
        if (!oldRoom) return;
        const exit = oldRoom.exits[direction];
        if (!exit)
            return this.sendToUser(user.uniquename, { type: 'error', message: "There is no exit in that direction!" });

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

        this.sendToUser(user.uniquename, {
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

        this.sendToRoom(room, {
            type: 'actor-moved',
            actorid: actor.id,
            actorname: actor.name,
            entered: false,
            direction: direction
        });
        room.actors.delete(actor);
    }

    private enteredRoom(actor: Actor, direction?: Direction) {
        const room = this.rooms.get(actor.roomid);
        if (!room)
            return;

        this.sendToRoom(room, {
            type: 'actor-moved',
            actorid: actor.id,
            actorname: actor.name,
            entered: true,
            direction: direction
        });
        room.actors.add(actor);

        if (isUser(actor)) {
            this.sendRoomDescription(actor);
        }
    }
}