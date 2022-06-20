"use strict";
// Check the role for the request required,
// and interrupt if the requirement is not satisfied.

// Import StatusCodes
const {StatusCodes} = require("http-status-codes");

// Export (function)
module.exports = (req, res, next) => {
    // Check auth exists
    if (!(req.auth && req.auth.id)) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return;
    }
    next();
};
