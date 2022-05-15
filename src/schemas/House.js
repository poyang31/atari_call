"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    price: Number, // 房租
    photo: String, // 照片
    isSold: Boolean, //是否租出
    address: String, //地址
    people: Number, //人數
    contact: Object, //聯絡方式
    soldDate: Number, //出租日期
    condition: Array //房屋條件
});
