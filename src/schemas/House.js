"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    people: Number, //人數
    price: Number, // 房租
    photo: String, // 照片
    contact: {
        LineID: String,
        phoneNumber: String
    }, //聯絡方式
    condition: Array, //房屋條件
    address: String, //地址
    isSold: Boolean, //是否租出
    soldTime: String, //承租時間
    isRemoved: Boolean //是否移除
});
