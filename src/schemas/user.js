"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = new Schema({
    username: String,
    password: String,
    favoriteArticleIds: Array,
    favoriteHouseIds: Array,
});
