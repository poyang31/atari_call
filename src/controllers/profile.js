"use strict";

const {Router: expressRouter} = require("express");

// Import modules
const middleware = {
    access: require("../middlewares/access"),
    inspector: require("../middlewares/inspector"),
    validator: require("express-validator"),
};

// Export routes mapper (function)
module.exports = (ctx, r) => {
    const router = expressRouter();

    router.get(
        "/",
        middleware.access,
        (req, res) => res.send(req.auth.metadata.user),
    );

    r.use("/profile", router);
};
