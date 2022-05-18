"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    people: Number, //人數
    price: Number, //房租
    contact: Object, //聯絡方式
    condition: Array, //房屋條件
    area: String, //地區
    isFound: Boolean, //是否已找到
    isRemoved: Boolean //是否移除
});
