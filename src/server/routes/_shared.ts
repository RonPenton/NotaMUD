import * as express from 'express';
import { config } from '../config';

export const router = express.Router();

export const ensureAuthenticated: express.RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see that page.");
        res.redirect("/login");
    }
}

export const redirectToGameIfAuthenticated: express.RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        // redirect to game if they're already authenticated.
        res.redirect("/game");
        return;
    }
    next();
}

router.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

router.get('/', function (_, res) {
    res.render('index', { title: `${config.Name} (${config.Version.toString()})` });
});

router.get("/game", ensureAuthenticated, function (_, res) {
    res.render("game");
});



export default router;