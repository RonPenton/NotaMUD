import * as AWS from 'aws-sdk';

import secrets from '../secrets';
import config, { dbconfig } from '../config';
import { Room } from '../models/room';
import { createRoom } from '../models/db';

const rooms: Room[] = require("../../data/rooms.json");

AWS.config.update(secrets.AWSConfig);

init();

export async function init() {
    const db = new AWS.DynamoDB();

    console.log(`Initializing ${config.Name} verison ${config.Version.toString()}...`);

    await initializeTable(db, dbconfig.users, "name", "string");
    await initializeTable(db, dbconfig.actors, "id", "number");
    await initializeTable(db, dbconfig.rooms, "id", "number");

    await loadRooms();

    console.log(`Complete!`);
}

export type KeyType = "string" | "number";

export async function initializeTable(db: AWS.DynamoDB, name: string, key: string, keyType: KeyType) {
    if (!await checkTableExists(db, name)) {
        await createTable(db, name, key, keyType);
    }
}

export function createTable(db: AWS.DynamoDB, name: string, key: string, keyType: KeyType): Promise<AWS.DynamoDB.CreateTableOutput> {
    console.log(`Creating table ${name}...`);
    const attributeType = keyType == "string" ? "S" : "N";
    const params = {
        TableName: name,
        KeySchema: [{ AttributeName: key, KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: key, AttributeType: attributeType }],
        ProvisionedThroughput: {
            ReadCapacityUnits: config.AWSReadCapacityUnits,
            WriteCapacityUnits: config.AWSWriteCapacityUnits
        }
    };

    return new Promise((resolve, reject) => {
        db.createTable(params, (err, data) => {
            if(err){
                reject(err);
                return;
            }
            resolve(data);
        });
    });


}

async function checkTableExists(db: AWS.DynamoDB, name: string): Promise<boolean> {
    console.log(`Checking to see if table ${name} exists...`);
    return new Promise<boolean>((resolve, _) => {
        db.describeTable({ TableName: name }, (err, _) => {
            if (err) {
                resolve(false)
                return;
            }
            resolve(true);
        });
    })
}


async function loadRooms() {
    rooms.forEach(async r => {
        console.log(`Inserting room: ${r.id}`);
        await createRoom(r);
    });
}