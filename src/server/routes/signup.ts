import * as passport from "passport";
import * as moment from 'moment';
import router, { redirectToGameIfAuthenticated } from './_shared';
import * as db from '../models/db';
import * as auth from '../auth';
import User, { getCanonicalName, isInvalidName } from '../models/user';

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
