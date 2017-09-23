import * as express from 'express';
import * as passport from "passport";

import { redirectToGameIfAuthenticated } from './index';
import { World } from '../models/world';

export function init(router: express.Router, _: World) {

    router.get("/login", redirectToGameIfAuthenticated, function (_, res) {
        res.render("login");
    });

    router.post("/login", passport.authenticate("login", {
        successRedirect: "/game",
        failureRedirect: "/login",
        session: true,
        failureFlash: true
    }));

    router.post("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });
}