import { VersionNumber } from './utils/versionnumber';

export const config = {
    Name: "NotaMUD",
    Version: new VersionNumber(0, 0, 1),
    Port: 3061,
    Dbprefix: "notamud_",
    AWSRegion: 'us-east-1',
    AWSReadCapacityUnits: 5,
    AWSWriteCapacityUnits: 5
}

export const dbconfig = {
    session: `${config.Dbprefix}session`,
    users: `${config.Dbprefix}user`,
    rooms: `${config.Dbprefix}room`,
    actors: `${config.Dbprefix}actor`
}

export default config;