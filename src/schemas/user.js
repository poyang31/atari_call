"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String, // 帳號
    password: String, // 密碼
    lastName: String, // 姓
    firstName: String, // 名,
    nickname: String, // 暱稱
    lineId: String, // lineId
    phone: String, // 電話
    favoriteArticleIds: Array, // 最愛的文章
    favoriteHouseIds: Array, // 最愛的房屋
});

userSchema.set("toJSON", {
    transform: function(doc, ret, _) {
        delete ret.password;
        return ret;
    },
});

module.exports = userSchema;
