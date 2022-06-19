"use strict";

const routes = [
    require("./auth"),
    require("./house"),
];

module.exports = (ctx, app) => {
    routes.forEach((c) => c(ctx, app));
};
