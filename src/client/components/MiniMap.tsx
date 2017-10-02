import * as Messages from '../../server/messages';
import Dexie from 'dexie';


export class ClientGameDatabase extends Dexie {
    rooms: Dexie.Table<Messages.RoomDescription, number>;

    constructor () {
        super("ClientGameDatabase");
        this.version(1).stores({
            rooms: '&id'
        });
    }

    public async addRoomReference(room: Messages.RoomDescription) {
        await clientGameDb.transaction("rw", clientGameDb.rooms, async() => {
            await clientGameDb.rooms.put(room);
        });
    }
}

export const clientGameDb = new ClientGameDatabase();


