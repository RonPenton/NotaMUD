import * as express from 'express';
import * as passport from "passport";

const router = express.Router();

/* GET home page. */
router.get('/', function(_, res) {
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

// router.use(function (req, res, next) {
//     res.locals.currentUser = req.user;
//     next();
// });

router.get("/login", function (_, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/game",
    failureRedirect: "/login",
    session: true
}));

//TODO: Maket POST to prevent CSRF attacks
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});


router.get("/game", ensureAuthenticated, function (_, res) {
    res.render("game");
});

export const routes = router;
export default routes;
