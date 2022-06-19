"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = new Schema({
    authorId: String, // 發布者Id
    houseInfo: {
        houseSize: Number, // 幾坪
        houseType: String, // 屋子類型 ( 公寓大樓  透天厝之類的  )
        roomType: String, // 房間類型  ( 整層住家 獨立套房 雅房之類的 )
        room: Object, // 房間類型+房數 ( 如3房1廳1衛 )
    }, // 房屋資訊
    price: Number, // 租金
    depositMethod: String, // 押金方式
    rentIncludes: Array, // 租金包含
    houseFace: String, // 房屋面向
    title: String, // 房屋名稱
    contact: {
        lineID: String, // LineID
        phoneNumber: String, // 電話號碼
        Role: String, // 身分 ex:房東、仲介、代理人
    }, // 聯絡方式
    houseDescription: String, // 房屋描述
    equipmentAndServices: {
        condition: {
            role: Array, // default: null | ['學生', '上班族', '家庭'],
            gender: String, // default: null | '限男性' | '限女性',
        },
        houseRule: Array, // 可養寵 可開伙
        equipment: Array,
    }, // 設備與服務
    address: {
        city: String, // 縣市
        township: String, // 鄉鎮
        others: String, // 其他詳細地址
    }, // 地址
    isRented: String, // 是否租出
    rentInfo: {
        date: String, // 入住日期
        atLeastTime: String, // 最短租期
    }, // 承租時間
    isRemoved: Boolean, // 是否移除
});
