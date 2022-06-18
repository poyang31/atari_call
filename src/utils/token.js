"use strict";
// Token utils.

// Import jsonwebtoken
const jwt = require("jsonwebtoken");

// Import UUID generator
const {v4: uuidV4} = require("uuid");

// Import SHA256 generator
const {sha256} = require("js-sha256");

// Define generalIssueOptions generator
const generalIssueOptions = (metadata) => ({
    algorithm: "HS256",
    expiresIn: "1d",
    notBefore: "500ms",
    audience: process.env.WEBSITE_URL,
    issuer: sha256(metadata.ctx.jwt_secret),
    noTimestamp: false,
    mutatePayload: false,
});

/**
 *
 * @param {object} ctx the context variable from app.js
 * @param {object} user the user data to issue
 * @return {string|null}
 */
function issueAuthToken(ctx, user) {
    const issueOptions = generalIssueOptions({ctx, type: "auth"});
    const jti = uuidV4(null, null, null);
    const payload = {
        jti,
        sub: user.id,
        user,
    };
    return jwt.sign(
        payload,
        ctx.jwt_secret,
        issueOptions,
        null,
    );
}

/**
 * Validate function
 * @param {object} ctx the context variable from app.js
 * @param {string} token the token to valid
 * @return {boolean|object}
 */
function validateAuthToken(ctx, token) {
    try {
        return jwt.verify(token, ctx.jwt_secret, null, null);
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * Replay attack protection
 * @param {object} ctx the context variable from app.js
 * @param {object} tokenData the data decoded from token
 * @return {boolean}
 */
function isGone(ctx, tokenData) {
    const keyName = `Token:${tokenData.jti}`;
    if (ctx.cache.has(keyName)) return true;
    ctx.cache.set(keyName, tokenData.iat, tokenData.exp - ctx.now());
    return false;
}

module.exports = {
    validateAuthToken,
};
