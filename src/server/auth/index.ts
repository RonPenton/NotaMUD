import * as passport from "passport";
import * as passport_local from "passport-local";
import Player from '../models/player';
const LocalStrategy = passport_local.Strategy;

export const init = () => {

    passport.serializeUser<Player, string>(function (user, done) {
        done(null, user.name);
    });

    passport.deserializeUser<Player, string>(function (id, done) {
        const player = { name: id } as Player;
        done(null, player);
    });

    passport.use("login", new LocalStrategy(function (username, password, done) {
        const player = { name: username } as Player;
        password;
        return done(null, player);
    }));
};
