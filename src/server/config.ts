import { VersionNumber } from './utils/versionnumber';

export const config = {
    Name: "NotaMUD",
    WelcomeMessage: "Welcome to NotaMUD, which is not a MUD! Yet! Enjoy your stay!",
    StartingRoom: 1,
    Version: new VersionNumber(0, 0, 1),
    Port: 3061,
    Dbprefix: "notamud_",
    AWSRegion: 'us-east-1',
    AWSReadCapacityUnits: 5,
    AWSWriteCapacityUnits: 5
}

export const dbconfig = {
    session: `${config.Dbprefix}session`,
    rooms: `${config.Dbprefix}room`,
    actors: `${config.Dbprefix}actor`
}

export default config;