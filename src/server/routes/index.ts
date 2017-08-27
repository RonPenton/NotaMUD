import * as express from 'express';
import * as passport from "passport";
import * as db from '../models/db';
import User from '../models/user';
import * as auth from '../auth';

const router = express.Router();

/* GET home page. */
router.get('/', function (_, res) {
    res.render('index', { title: 'NotaMUD' });
});

export type RequestHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => void;

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

router.get("/login", function (_, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/game",
    failureRedirect: "/login",
    session: true
}));

router.post("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

router.get("/game", ensureAuthenticated, function (_, res) {
    res.render("game");
});

router.get("/signup", function (_, res) {
    res.render("signup");
});

router.post("/signup", async function (req, res, next) {

    var username = req.body.username as string;
    var password = req.body.password as string;

    try {
        const user = await db.getUser(username);
        if (user) {
            return res.redirect("/signup?exists");
        }

        const hash = await auth.hash(password);

        const newUser: User = {
            name: username,
            passwordHash: hash,
            created: new Date(),
            lastLogin: new Date()
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
