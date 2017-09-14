import { User } from "./user";
import { Actor } from "./actor";
import { Room } from "./room";
import { Scriptable } from "./scriptable";



export class World implements Scriptable {
    private users = new Map<string, User>();
    private activeUsers = new Map<string, User>();
    // private actors = new Map<number, Actor>();
    // private rooms = new Map<number, Room>();

    public data: { [index: string]: any } = [];

    public userCreated(user: User) {
        if (this.users.has(user.name))
            throw new Error("Cannot add user to world, username taken.");

        this.users.set(user.name, user);
    }

    public userConnected(user: User) {
        if(this.activeUsers.has(user.name)){
            // todo: disconnect user.
        }

        this.activeUsers.set(user.name, user);
    }
}