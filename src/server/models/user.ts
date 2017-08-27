export interface User {
    name: string;
    passwordHash: string;
    created: Date;
    lastLogin: Date;
    suspendedUntil?: Date;
}

export default User;