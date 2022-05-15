"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    local: String, //地區
    price: Number, //房租
    contant: Object, //聯絡方式
    people: Number, //人數
    idFound: Boolean, //是否已找到
    condition: Array //房屋條件
});
