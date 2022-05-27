"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    id: ObjectId,
    houseInfo: {
        houseSize: Number, //幾坪
        houseType: String,  //屋子類型 ( 公寓大樓  透天厝之類的  )
        roomType: String,   //房間類型  ( 套房 雅房之類的 )
        room: Array //房間類型+房數 ( 如3房1廳1衛 )
    },  //房屋資訊
    people: Number, //人數
    price: Number, // 租金  
    photo: Array, // 照片
    contact: {
        lineID: String, //LineID
        phoneNumber: String //電話號碼
    }, //聯絡方式
    furniture: Array, //家具 ( 衣櫃 冷氣 熱水器 洗衣機 微波爐 )
    publicUtilities: Array, //公共設施 ( 游泳池 交誼廳 客廳 飲水機 洗衣機 ) 
    address: {
        city:String,  //縣市
        township:String, //鄉鎮
        others:String  //其他詳細地址
    }, //地址
    isRented: String, //是否租出
    rentInfo: {
        date: String, //入住日期
        atLeastTime: String //最短租期
    }, //承租時間
    isRemoved: Boolean //是否移除
});
