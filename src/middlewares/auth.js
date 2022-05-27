const {validateAuthToken} = require("../utils/token");
const {getUserPreferences} = require("../utils/user_preferences");

module.exports = (ctx) => {
    return function (req, res, next) {
        const auth_code = req.header("Authorization");
        if (!auth_code) {
            next();
            return;
        }
        const params = auth_code.split(" ");
        if (params.length !== 2) {
            next();
            return;
        }
        req.auth_method = params[0];
        switch (params[0]) {
            case "SARA": {
                req.authenticated = validateAuthToken(ctx, params[1]);
                if (req.authenticated) {
                     getUserPreferences(ctx, req.authenticated.sub)
                         .then((preferences) => req.authenticated.preferences = preferences)
                         .catch((e) => console.error(e));
                }
                break;
            }
        }
        next();
    };
}
