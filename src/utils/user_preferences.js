const schema = {
    user_preferences: require("../schemas/User")
};

async function getUserPreferences(ctx, user_id) {
    const UserPreferences = ctx.database.model("UserPreferences", schema.user_preferences);
    const user_preferences = await UserPreferences.find(user_id).exec();
    return user_preferences || null;
}

module.exports = {
    getUserPreferences
};
