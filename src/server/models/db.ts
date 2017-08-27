import * as AWS from 'aws-sdk';
import User from './user';

import secrets from '../secrets';
import { dbconfig } from '../config';

AWS.config.update(secrets.AWSConfig);

//const db = new AWS.DynamoDB();
const dc = new AWS.DynamoDB.DocumentClient();

export async function getUser(name: string): Promise<User | null> {
    return getItem<User>(dbconfig.users, "name", name);
}

export async function createUser(user: User) : Promise<void> {
    return createItem(dbconfig.users, user);
}




async function createItem<T>(table: string, item: T): Promise<void> {
    const params = {
        TableName: table,
        Item: item
    }
    
    return new Promise<void>((resolve, reject) => {
        dc.put(params, (err, _) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

async function getItem<T>(table: string, keyName: string, key: string | number): Promise<T> {
    var keyObject: any = {};
    keyObject[keyName] = key;
    const params = {
        TableName: table,
        Key: keyObject
    };
    return new Promise<T>((resolve, reject) => {
        dc.get(params, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data.Item as T);
        });
    });
}