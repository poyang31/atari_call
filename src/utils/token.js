"use strict";

const jwt = require("jsonwebtoken");

/**
 * validateAuthToken
 * @param {object} ctx
 * @param {string} token
 * @return {*|boolean}
 */
function validateAuthToken(ctx, token) {
    try {
        return jwt.verify(token, ctx.jwt_secret, null, null);
    } catch (e) {
        console.error(e);
        return false;
    }
}

module.exports = {
    validateAuthToken,
};
