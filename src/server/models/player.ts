export interface Player {
    name: string;
    passwordHash: string;
    created: Date;
    lastLogin: Date;
    suspendedUntil?: Date;
}

export default Player;