import * as AWS from 'aws-sdk';
import * as moment from 'moment';

import User, { getCanonicalName } from './user';
import secrets from '../secrets';
import { dbconfig } from '../config';

AWS.config.update(secrets.AWSConfig);

//const db = new AWS.DynamoDB();
const dc = new AWS.DynamoDB.DocumentClient();

export async function getUser(name: string): Promise<User | null> {
    return getItem<User>(dbconfig.users, "name", getCanonicalName(name));
}

export async function createUser(user: User): Promise<void> {
    return createItem(dbconfig.users, user);
}

// Stolen from moment.js
const isoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

function prepareItemForDatabase<T>(item: T, set?: Set<any>): any {
    // use a set to track any objects that are added, to prevent circular references
    // (and therefore stack overflows, which are bad.)
    if (!set)
        set = new Set<any>();
    if (set.has(item))
        return undefined;

    let clone: any = {};
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            const value = item[key];
            if (value instanceof moment) {
                clone[key] = (<moment.Moment><any>value).toISOString();
            }
            else if (value === null || value === undefined) {
                // check null and undefined before object because 
                // they return true when testing against 'object'. 
                // God damnit Javascript. 
                clone[key] = value;
            }
            else if (typeof value === 'object') {
                clone[key] = prepareItemForDatabase(value, set);
            }
            else {
                clone[key] = value;
            }
        }
    }
    return clone;
}

function prepareItemFromDatabase(item: any): void {
    if(!item)
        return;
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            const value = item[key];
            if (typeof value === 'string') {
                if (isoRegex.test(value)) {
                    item[key] = moment(value);
                }
            }
            else if (typeof value === 'object' && value !== null && value !== undefined) {
                prepareItemFromDatabase(value);
            }
        }
    }
}

async function createItem<T>(table: string, item: T): Promise<void> {
    const params = {
        TableName: table,
        Item: prepareItemForDatabase(item)
    }

    return new Promise<void>((resolve, reject) => {
        dc.put(params, (err, _) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

async function getItem<T>(table: string, keyName: string, key: string | number): Promise<T> {
    const keyObject: any = {};
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
            prepareItemFromDatabase(data.Item);
            resolve(data.Item as T);
        });
    });
}