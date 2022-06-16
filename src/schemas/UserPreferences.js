"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    articleIds: Array,
    houseIds: Array,
    favoriteArticleIds: Array,
    favoriteHouseIds: Array,
});
