import { } from '../config';

import * as express from 'express';
import * as passport from 'passport';
import * as moment from 'moment';

import { redirectToGameIfAuthenticated } from './index';
import * as db from '../models/db';
import * as auth from '../auth';
import { World } from '../models/world';
import User, { getCanonicalName, isInvalidName } from '../models/user';
import config from '../config';

export function init(router: express.Router, world: World) {

    router.get("/signup", redirectToGameIfAuthenticated, function (_, res) {
        res.render("signup");
    });

    router.post("/signup", async function (req, res, next) {
        const username = req.body.username as string;
        const password = req.body.password as string;

        try {
            if (isInvalidName(username)) {
                req.flash("error", "Invalid User Name. Names cannot contain spaces, numbers, symbols, or extended ASCII characters.");
                return res.redirect("/signup");
            }

            const user = world.getUser(username);
            if (user) {
                req.flash("error", "Username already taken");
                return res.redirect("/signup");
            }

            const hash = await auth.hash(password);

            const newUser: User = {
                id: world.getNextActorId(),
                roomid: config.StartingRoom,
                uniquename: getCanonicalName(username),
                name: username,
                passwordHash: hash,
                created: moment(),
                lastLogin: moment()
            };

            try {
                await db.Actors.create(newUser);
                world.userCreated(newUser);
            }
            catch(error) {
                req.flash("error", error);
                res.redirect("/signup")
            }


            req.login(newUser, (err: any) => {
                if(err) {
                    req.flash("error", err);
                    return;
                }

                res.redirect("/game");
            });
        }
        catch (error) {
            next(error);
        }
    }, passport.authenticate("login", {
        successRedirect: "/",
        failureRedirect: "/signup",
        failureFlash: true
    }));
}
