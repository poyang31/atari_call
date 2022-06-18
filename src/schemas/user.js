"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = new Schema({
    username: String, // 帳號
    password: String, // 密碼
    lastName: String, // 姓
    firstName: String, // 名
    lineId: String, // lineId
    phone: String, // 電話
    favoriteArticleIds: Array, // 最愛的文章
    favoriteHouseIds: Array, // 最愛的房屋
});
