const {StatusCodes} = require("http-status-codes");
const {Router: expressRouter} = require("express");

// Import modules
const schema = {
    house: require("../schemas/house"),
};
const middleware = {
    inspector: require("../middlewares/inspector"),
    validator: require("express-validator"),
};

// Export routes mapper (function)
module.exports = (ctx, r) => {
    const router = expressRouter();

    // 取得房屋列表
    router.get(
        "/list",
        middleware.validator.query("page").isNumeric(),
        middleware.inspector,
        async (req, res) => {
            // 取得房屋模組
            const House = ctx.database.model("House", schema.house);
            // 解析 page 為數字 (int)
            const pageInt = parseInt(req.query.page);
            // 運算 page 的起始索引
            const page = pageInt > 0 ? pageInt - 1 : 0;
            // 取得未標示為被刪除的的文章列表
            const filter = {
                "isRemoved": false,
                "isRented": false,
                "address": {
                    city: {"$in": req.query.address.city},
                    township: {"$in": req.query.address.township},
                },
                "houseInfo.houseType": req.query.houseInfo.houseType,
                "houseInfo.roomType": req.query.houseInfo.roomType,
                "price": {
                    "$lte": req.query.price[1],
                    "$gte": req.query.price[0],
                },
                "houseInfo.room.房間": {"$gte": req.query.houseInfo.room.房間},
                "houseInfo.room.衛浴": {"$gte": req.query.houseInfo.room.衛浴},
                "houseInfo.room.廳數": {"$gte": req.query.houseInfo.room.廳數},
                "equipmentAndServices": {
                    condition: {
                        role: {
                            "$all": req
                                .query
                                .equipmentAndServices
                                .condition
                                .role,
                        },
                        gender: req
                            .query
                            .equipmentAndServices
                            .condition
                            .gender
                        ,
                    },
                    houseRule: {
                        "$all": req.query.equipmentAndServices.house,
                    },
                    equipment: {
                        "$all": req.query.equipmentAndServices.equipment,
                    },
                },

            };
            if (req.query.address.township) {
                filter["address.township"] = {};
            }
            if (req.query.houseInfo.houseType) {
                filter["houseInfo.houseType"] = {};
            }
            if (req.query.houseInfo.roomType) {
                filter["houseInfo.roomType"] = {};
            }
            if (req.query.equipmentAndServices.houseRule) {
                filter["equipmentAndServices.houseRule"] = {};
            }
            if (req.query.equipmentAndServices.equipment) {
                filter["equipmentAndServices.equipment"] = {};
            }
            if (req.query.equipmentAndServices.condition.role) {
                filter["equipmentAndServices.condition.role"] = {};
            }

            const house = await House.find(filter)
                .skip(page * 10)
                .limit(10)
                .exec();
            // 回傳房屋列表
            res.send(house);
        },
    );

    // 查詢房屋
    router.get(
        "/",
        middleware.validator.query("id").isString(),
        middleware.inspector,
        async (req, res) => {
            // 取得房屋的 Model
            const House = ctx.database.model("House", schema.house);
            // 透過 id 取得該房屋
            let house;
            try {
                house = await House.findById(req.query.id).exec();
            } catch (e) {
                if (e.kind !== "ObjectId") console.error(e);
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            // 檢查該房屋是否存在
            if (!house || house.isRemoved) {
                // 如果沒有找到該房屋，或已標示為被刪除的，將回傳 NOT_FOUND，並且結束函式
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }
            // 回傳該篇文章
            res.send(house);
        },
    );

    // 建立房屋
    router.post(
        "/",
        middleware.validator.body("id").isEmpty(),
        middleware.validator.body("houseInfo").isObject(),
        middleware.validator.body("people").isNumeric(),
        middleware.validator.body("price").isNumeric(),
        middleware.validator.body("title").isString(),
        middleware.validator.body("photo").isArray(),
        middleware.validator.body("contact").isObject(),
        middleware.validator.body("furniture").isArray(),
        middleware.validator.body("publicUtilities").isArray(),
        middleware.validator.body("address").isString(),
        middleware.validator.body("isRented").isString(),
        middleware.validator.body("rentInfo").isObject(),
        middleware.validator.body("isRemoved").isBoolean(),
        middleware.inspector,
        async (req, res) => {
            // 取得文章的 Model
            const House = ctx.database.model("House", schema.house);
            // 建立新的文章
            const house = new House(req.body);
            // 強制設定 authorId 為 作者 id
            house.authorId = req.authenticated.sub;
            // 強制設定 isRemoved 為 false
            house.isRemoved = false;
            // 儲存文章
            if (await house.save()) {
                // 如果儲存成功，將回傳 CREATED
                res.sendStatus(StatusCodes.CREATED);
            } else {
                // 如果儲存失敗，將回傳 INTERNAL_SERVER_ERROR
                res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        },
    );

    // 修改房屋
    router.put(
        "/",
        middleware.validator.body("id").isEmpty(),
        middleware.validator.body("houseInfo").isObject(),
        middleware.validator.body("people").isNumeric(),
        middleware.validator.body("price").isNumeric(),
        middleware.validator.body("title").isString(),
        middleware.validator.body("photo").isArray(),
        middleware.validator.body("contact").isObject(),
        middleware.validator.body("furniture").isArray(),
        middleware.validator.body("publicUtilities").isArray(),
        middleware.validator.body("address").isString(),
        middleware.validator.body("isRented").isString(),
        middleware.validator.body("rentInfo").isObject(),
        middleware.validator.body("isRemoved").isBoolean(),
        middleware.inspector,
        async (req, res) => {
            // 取得房屋的 Model
            const House = ctx.database.model("House", schema.house);
            // 透過 id 取得該房屋
            let house;
            try {
                house = await House.findById(req.body.id).exec();
            } catch (e) {
                if (e.kind !== "ObjectId") console.error(e);
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            // 檢查該房屋是否存在
            if (!house || house.isRemoved) {
                // 如果沒有找到該房屋，或已標示為被刪除的，將回傳 NOT_FOUND，並且結束函式
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }
            // 將資料更新到該房屋
            house = {...house, ...req.body};
            // 強制設定 isRemoved 為 false
            house.isRemoved = false;
            // 儲存房屋
            if (await house.save()) {
                // 如果儲存成功，將回傳 OK
                res.sendStatus(StatusCodes.NO_CONTENT);
            } else {
                // 如果儲存失敗，將回傳 INTERNAL_SERVER_ERROR
                res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        },
    );

    // 刪除房屋
    router.delete(
        "/",
        middleware.validator.query("id").isString(),
        middleware.inspector,
        async (req, res) => {
            // 取得房屋的 Model
            const House = ctx.database.model("House", schema.house);
            // 透過 id 取得該房屋
            let house;
            try {
                house = await House.findById(req.query.id).exec();
            } catch (e) {
                // 如果 id 不是 ObjectId 的話，則顯示錯誤
                if (e.kind !== "ObjectId") console.error(e);
                // 查詢發生錯誤，一律回傳 BAD_REQUEST
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            // 檢查該房屋是否存在
            if (!house) {
                // 如果沒有找到該房屋，就回傳 NOT_FOUND，並且結束函式
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }
            // 檢查房屋是否已被刪除
            if (!house.isRemoved) {
                // 若該房屋已經未被標示為刪除，則將其設定為刪除，並且回傳 NO_CONTENT
                house.isRemoved = true;
                await house.save();
                res.sendStatus(StatusCodes.NO_CONTENT);
            } else if (await house.delete()) {
                // 若該房屋已經被標示為刪除，則直接刪除，並且回傳 NO_CONTENT
                res.sendStatus(StatusCodes.NO_CONTENT);
            } else {
                // 刪除失敗，一律回傳 INTERNAL_SERVER_ERROR
                res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        },
    );

    r.use("/house", router);
};
