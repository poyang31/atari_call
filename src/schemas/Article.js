"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    people: Number, //人數
    price: Number, //房租
    contact: {
        lineID: String,  //lineID
        phoneNumber: String // 電話號碼
    }, //聯絡方式
    furniture: Array, //家具 ( 衣櫃 冷氣 熱水器 洗衣機 微波爐 )
    publicUtilities: Array, //公共設施 ( 游泳池 交誼廳 客廳 飲水機 洗衣機 ) 
    area: String, //地區
    isFound: Boolean, //是否已找到
    isRemoved: Boolean //是否移除
});
