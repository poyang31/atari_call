const routes = [
    require("./auth"),
    require("./article"),
    require("./house"),
];

module.exports = (ctx, app) => {
    routes.forEach((c) => c(ctx, app));
};
