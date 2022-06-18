"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    username: String,
    password: String,
    favoriteArticleIds: Array,
    favoriteHouseIds: Array,
});
