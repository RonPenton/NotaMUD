import * as passport from "passport";
import * as passport_local from "passport-local";
import * as bcrypt from 'bcrypt-nodejs';
import { getUser } from '../models/db';
import User from '../models/user';
const LocalStrategy = passport_local.Strategy;

export const hash = (password: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        bcrypt.genSalt(10, (error, salt) => {
            if(error) return reject(error);
            bcrypt.hash(password, salt, () => {}, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    });
}

// export const validatePassword = (user: User, password: string): Promise<boolean> => {
//     return new Promise<boolean>((resolve, reject) => {
//         bcrypt.compare(password, user.passwordHash, (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//         })
//     });
// }

export const init = () => {
    passport.serializeUser<User, string>(function (user, done) {
        done(null, user.name);
    });

    passport.deserializeUser<User, string>(async function (id, done) {
        try {
            const user = await getUser(id);
            if (!user) {
                return done("No user!");
            }
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });

    passport.use("login", new LocalStrategy(async function (username, password, done) {
        const user = await getUser(username);
        if (!user) {
            return done(null, false, { message: "No user has that username!" });
        }

        bcrypt.compare(password, user.passwordHash, (err, result) => {
            if (err) return done(err);
            if (!result) return done(null, false, { message: "Invalid password." });
            return done(null, user);
        });
    }));
};
