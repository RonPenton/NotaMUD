import { User } from './models/user';
import * as passport from 'passport';
import * as passport_local from 'passport-local';
import * as bcrypt from 'bcrypt-nodejs';
import { ErrorRequestHandler } from 'express';
import * as moment from 'moment';
import { World } from "./models/world";
const LocalStrategy = passport_local.Strategy;

export const hash = (password: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        bcrypt.genSalt(10, (error, salt) => {
            if (error) return reject(error);
            bcrypt.hash(password, salt, () => { }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    });
}

export const catchAuthErrorsMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    if (err == MISSING_USER_RECORD || err == BANNED) {
        req.logout(); // So deserialization won't continue to fail.
        res.redirect("/login");
    } else {
        next();
    }
}

export const MISSING_USER_RECORD = "Missing User Record";
export const BANNED = "User is banned";

export const init = (world: World) => {
    passport.serializeUser<User, string>(function (user, done) {
        done(null, user.uniquename);
    });

    passport.deserializeUser<User, string>(async function (id, done) {
        try {
            const user = world.getUser(id);
            if (!user) {
                return done(MISSING_USER_RECORD);
            }
            if (user.suspendedUntil && user.suspendedUntil.isAfter(moment())) {
                return done(BANNED);
            }
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });

    passport.use("login", new LocalStrategy(async function (username, password, done) {
        const user = await world.getUser(username);
        if (!user) {
            return done(null, false, { message: "No user has that username!" });
        }

        bcrypt.compare(password, user.passwordHash, (err, result) => {
            if (err) return done(err);
            if (!result) return done(null, false, { message: "Invalid password." });
            if (user.suspendedUntil && user.suspendedUntil.isAfter(moment())) {
                const reason = user.suspensionReason ? ` for ${user.suspensionReason}` : "";
                return done(null, false, { message: `You are suspended until ${user.suspendedUntil.format()}${reason}` });
            }

            return done(null, user);
        });
    }));
};
