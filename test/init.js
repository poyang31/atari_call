"use strict";

// Load configs from .env
require("dotenv").config();

// Import fs
const fs = require("fs");

// Import modules
const ctx = {
    testing: true,
    now: () => Math.floor(new Date().getTime() / 1000),
    cache: require("../src/init/cache"),
    database: require("../src/init/database"),
    jwt_secret: require("../src/init/jwt_secret"),
};

// Define saveToken
const readToken = () => {
    const keyPath = __dirname + "/../test.key";
    return fs.existsSync(keyPath)
        ? fs.readFileSync(keyPath)
        : null;
};

// Define saveToken
const saveToken = (authToken) => {
    const keyPath = __dirname + "/../test.key";
    fs.writeFileSync(keyPath, authToken);
};

// Initialize application
const app = require("../src/init/express")(ctx);

// Map routes
require("../src/controllers/index")(ctx, app);

// Export (object)
module.exports = {app, ctx, readToken, saveToken};
