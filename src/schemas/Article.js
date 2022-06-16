"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    authorId: String, //發布者id
    people: Number, //人數
    price: Number, //房租
    title: String, //文章名稱
    contact: {
        lineID: String,  //lineID
        phoneNumber: String // 電話號碼
    }, //聯絡方式
    articleDescription: String, //房客描述
    equipmentAndServices: {
        condition: Array, //男女皆可 student officeWorker year
        houseRule: Array, //可養寵物 可開火
        equipment: Array, //提供設備 床 書桌 冰箱 冷氣 熱水器
        service: Array, //提供服務 網路 第四台 電梯 車位
        publicUtilities: Array //公共設施  游泳池 視聽室
    }, //設備與服務
    area: {
        city: String, //城市
        township: Array //鄉鎮
    }, //地區
    isFound: Boolean, //是否已找到
    isRemoved: Boolean //是否移除
});
