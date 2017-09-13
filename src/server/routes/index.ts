import * as express from 'express';
import * as passport from "passport";
import * as moment from 'moment';
import * as db from '../models/db';
import User, { getCanonicalName, isInvalidName } from '../models/user';
import * as auth from '../auth';

const router = express.Router();

router.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

/* GET home page. */
router.get('/', function (_, res) {
    res.render('index', { title: 'NotaMUD' });
});

export type RequestHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => void;

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see that page.");
        res.redirect("/login");
    }
}

router.get("/login", function (req, res) {
    req.flash('test', 'it worked');
    if (req.isAuthenticated()) {
        // redirect to game if they're already authenticated.
        res.redirect("/game");
        return;
    }
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

router.get("/game", ensureAuthenticated, function (_, res) {
    res.render("game");
});

router.get("/signup", function (req, res) {
    if (req.isAuthenticated()) {
        // redirect to game if they're already authenticated.
        res.redirect("/game");
        return;
    }
    res.render("signup");
});

router.post("/signup", async function (req, res, next) {

    const username = req.body.username as string;
    const password = req.body.password as string;

    try {
        if(isInvalidName(username)) {
            req.flash("error", "Invalid User Name. Names cannot contain spaces, numbers, symbols, or extended ASCII characters.");
            return res.redirect("/signup");
        }

        const user = await db.getUser(username);
        if (user) {
            req.flash("error", "Username already taken");
            return res.redirect("/signup");
        }

        const hash = await auth.hash(password);

        const newUser: User = {
            name: getCanonicalName(username),
            displayName: username,
            passwordHash: hash,
            created: moment(),
            lastLogin: moment()
        };

        await db.createUser(newUser);
        next();
    }
    catch (error) {
        next(error);
    }
}, passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
}));



export const routes = router;
export default routes;
