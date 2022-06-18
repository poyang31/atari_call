"use strict";

const schema = {
    userPreferences: require("../schemas/UserPreferences"),
};

/**
 * getUserPreferences
 * @param {object} ctx
 * @param {string} userId
 * @return {Promise<Array<HydratedDocument<any, {}, {}>>|null>}
 */
async function getUserPreferences(ctx, userId) {
    const UserPreferences = ctx.database.model(
        "UserPreferences",
        schema.userPreferences,
    );
    const userPreferences = await UserPreferences.find(userId).exec();
    return userPreferences || null;
}

module.exports = {
    getUserPreferences,
};
