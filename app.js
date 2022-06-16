"use strict";

// 載入 .env 檔案
require("dotenv").config();

// HTTP 狀態碼常數表
const { StatusCodes } = require("http-status-codes");

const
    // 常數
    constant = require("./src/init/const"),
    // 狀態
    ctx = {
        now: () => Math.floor(new Date().getTime() / 1000),
        cache: require("./src/init/cache"),
        database: require("./src/init/database"),
        jwt_secret: require("./src/init/jwt_secret"),
    },
    // 工具
    util = {
        hash: require('js-sha256'),
        ip_address: require("./src/utils/ip_address"),
    },
    // 結構
    schema = {
        article: require("./src/schemas/Article"),
        house: require("./src/schemas/House")
    },
    // 中間件
    middleware = {
        validator: require("express-validator"),
        file_upload: require("express-fileupload"),
        access: require("./src/middlewares/access"),
        inspector: require("./src/middlewares/inspector"),
    };

// 初始化 express 實例
const app = require("./src/init/express")(ctx);

// 初始化 Swagger 實例
const
    swagger = require("swagger-ui-express"),
    swaggerDocument = require('./swagger.json');

// 將 API 首頁轉址到前端頁面
app.get("/", (_, res) => {
    res.redirect(StatusCodes.MOVED_PERMANENTLY, process.env.WEBSITE_URL);
});

// API 文檔頁面
app.use('/docs', swagger.serve, swagger.setup(swaggerDocument));

// 取得使用者 IP 位置（測試網路狀態）
app.get("/ip", (req, res) => {
    res.send({ ip_address: util.ip_address(req) });
});

// 取得文章列表
app.get(
    "/articles",
    middleware.validator.query("page").isNumeric(),
    middleware.inspector,
    async (req, res) => {
        // 取得文章的 Model
        const Article = ctx.database.model("Article", schema.article);
        // 解析 page 為數字（int）
        const page_int = parseInt(req.query.page);
        // 運算 page 的起始索引
        const page = page_int > 0 ? page_int - 1 : 0;
        // 取得未標示為被刪除的的文章列表
        const articles = await Article.find({
            isRemoved: false
        })
            .skip(page * 12)
            .limit(12)
            .exec();
        // 回傳文章列表
        res.send(articles);
    }
);

// 查詢文章
app.get(
    "/article",
    middleware.validator.query("id").isString(),
    middleware.inspector,
    async (req, res) => {
        // 取得文章的 Model
        const Article = ctx.database.model("Article", schema.article);
        // 透過 id 取得該篇文章
        let article;
        try {
            article = await Article.findById(req.query.id).exec();
        } catch (e) {
            if (e.kind !== "ObjectId") console.error(e);
            res.sendStatus(StatusCodes.BAD_REQUEST);
            return;
        }
        // 檢查該篇文章是否存在
        if (!article || article.isRemoved) {
            // 如果沒有找到該篇文章，或已標示為被刪除的，將回傳 NOT_FOUND，並且結束函式
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        // 回傳該篇文章
        res.send(article);
    }
);

// 建立文章
app.post(
    "/article",
    middleware.access(null),
    middleware.validator.body("id").isString(),
    middleware.validator.body("houseInfo").isObject(),
    middleware.validator.body("price").isNumeric(),
    middleware.validator.body("depositMethod").isString(),
    middleware.validator.body("rentIncludes").isArray(),
    middleware.validator.body("houseFace").isString(),
    middleware.validator.body("title").isString(),
    middleware.validator.body("contact").isObject(),
    middleware.validator.body("articleDescription").isString(),
    middleware.validator.body("equipmentAndServices").isObject(),
    middleware.validator.body("area").isObject(),
    middleware.validator.body("isFound").isBoolean(),
    middleware.validator.body("isRemoved").isEmpty(),
    middleware.inspector,
    async (_, res) => {
        // 取得文章的 Model
        const Article = ctx.database.model("Article", schema.article);
        // 建立新的文章
        const article = new Article(res.body);
        // 強制設定 authorId 為 作者 id
        article.authorId = req.authenticated.sub;
        // 強制設定 isFound 為 false
        article.isFound = false;
        // 強制設定 isRemoved 為 false
        article.isRemoved = false;
        // 儲存文章
        if (await article.save()) {
            // 如果儲存成功，將回傳 CREATED
            res.sendStatus(StatusCodes.CREATED);
        } else {
            // 如果儲存失敗，將回傳 INTERNAL_SERVER_ERROR
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
);

// 修改文章
app.put(
    "/article",
    middleware.access(null),
    middleware.validator.body("id").isString(),
    middleware.validator.body("houseInfo").isObject(),
    middleware.validator.body("authorId").isEmpty(),
    middleware.validator.body("price").isNumeric(),
    middleware.validator.body("title").isString(),
    middleware.validator.body("contact").isObject(),
    middleware.validator.body("articleDescription").isString(),
    middleware.validator.body("equipmentAndServices").isObject(),
    middleware.validator.body("area").isObject(),
    middleware.validator.body("isFound").isBoolean(),
    middleware.validator.body("isRemoved").isEmpty(),
    middleware.inspector,
    async (req, res) => {
        // 取得文章的 Model
        const Article = ctx.database.model("Article", schema.article);
        // 透過 id 取得該篇文章
        let article;
        try {
            article = await Article.findById(req.body.id).exec();
        } catch (e) {
            if (e.kind !== "ObjectId") console.error(e);
            res.sendStatus(StatusCodes.BAD_REQUEST);
            return;
        }
        // 如果文章作者與請求者id不同，則顯示錯誤
        if (!article.authorId === req.authenticated.sub) {
            res.sendStatus(StatusCodes.BAD_REQUEST)
            return;
        }
        // 檢查該篇文章是否存在
        if (!article || article.isRemoved) {
            // 如果沒有找到該篇文章，或已標示為被刪除的，將回傳 NOT_FOUND，並且結束函式
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        // 將資料更新到該篇文章
        article = { ...article, ...req.body };
        // 強制設定 isRemoved 為 false
        article.isRemoved = false;
        // 儲存文章
        if (await article.save()) {
            // 如果儲存成功，將回傳 OK
            res.sendStatus(StatusCodes.NO_CONTENT);
        } else {
            // 如果儲存失敗，將回傳 INTERNAL_SERVER_ERROR
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
);

// 刪除文章
app.delete(
    "/article",
    middleware.access(null),
    middleware.validator.query("id").isString(),
    middleware.inspector,
    async (req, res) => {
        // 取得文章的 Model
        const Article = ctx.database.model("Article", schema.article);
        // 透過 id 取得該篇文章
        let article;
        try {
            article = await Article.findById(req.query.id).exec();
        } catch (e) {
            // 如果 id 不是 ObjectId 的話，則顯示錯誤
            if (e.kind !== "ObjectId") console.error(e);
            // 查詢發生錯誤，一律回傳 BAD_REQUEST
            res.sendStatus(StatusCodes.BAD_REQUEST);
            return;
        }
        // 檢查該篇文章是否存在
        if (!article) {
            // 如果沒有找到該篇文章，就回傳 NOT_FOUND，並且結束函式
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        // 如果文章作者與請求者id不同，則顯示錯誤
        if (!article.authorId === req.authenticated.sub) {
            res.sendStatus(StatusCodes.BAD_REQUEST)
            return;
        }

        // 檢查文章是否已被刪除
        if (!article.isRemoved) {
            // 若該篇文章已經未被標示為刪除，則將其設定為刪除，並且回傳 NO_CONTENT
            article.isRemoved = true;
            await article.save();
            res.sendStatus(StatusCodes.NO_CONTENT);
        } else if (await article.delete()) {
            // 若該篇文章已經被標示為刪除，則直接刪除，並且回傳 NO_CONTENT
            res.sendStatus(StatusCodes.NO_CONTENT);
        } else {
            // 刪除失敗，一律回傳 INTERNAL_SERVER_ERROR
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
);

// 建立圖片
app.post(
    "/house/photo",
    middleware.access(null),
    middleware.file_upload({
        limits: { fileSize: 50 * 1024 * 1024 },
    }),
    (req, res) => {
        if (!req.files?.file) {
            res.sendStatus(StatusCodes.BAD_REQUEST);
            return;
        }
        res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE);
    }
);

// 取得房屋列表
app.get(
    "/houses",
    middleware.validator.query("page").isNumeric(),
    middleware.inspector,
    async (req, res) => {
        // 取得房屋模組
        const House = ctx.database.model("House", schema.house);
        // 解析 page 為數字 (int)
        const page_int = parseInt(req.query.page);
        // 運算 page 的起始索引
        const page = page_int > 0 ? page_int - 1 : 0;

        const filter = {
            isRemoved: false,
            isRented: false,
            address: {
                city: req.query.address.city,
                township: { $in: req.query.address.township }
            },
            "houseInfo.houseType": req.query.houseInfo.houseType,
            "houseInfo.roomType": req.query.houseInfo.roomType,
            price: {
                $lte: req.query.price[1],
                $gte: req.query.price[0]
            },
            "houseInfo.room.房間": { $gte: req.query.houseInfo.room.房間 },
            "houseInfo.room.衛浴": { $gte: req.query.houseInfo.room.衛浴 },
            "houseInfo.room.廳數": { $gte: req.query.houseInfo.room.廳數 },
            equipmentAndServices: {
                condition: { $all: req.query.equipmentAndServices.condition },
                houseRule: { $all: req.query.equipmentAndServices.house },
                equipment: { $all: req.query.equipmentAndServices.equipment }
            }
        }
        if (req.query.address.township) {
            filter["address.township"] = {}
        }
        if (req.query.houseInfo.houseType) {
            filter["houseInfo.houseType"] = {}
        }
        if (req.query.houseInfo.houseType) {
            filter["houseInfo.roomType"] = {}
        }
        if (req.query.equipmentAndServices.condition) {
            filter["houseInfo.houseType"] = {}
        }
        if (req.query.equipmentAndServices.houseRule) {
            filter["houseInfo.houseType"] = {}
        }
        if (req.query.equipmentAndServices.equipment) {
            filter["houseInfo.houseType"] = {}
        }




        // 取得未標示為被刪除的的文章列表
        const house = await House.find(filter)
            .skip(page * 10)
            .limit(10)
            .exec();
        // 回傳房屋列表
        res.send(house);
    }
);

// 查詢房屋
app.get(
    "/house",
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
    }
);

// 建立房屋
app.post(
    "/house",
    middleware.access(null),
    middleware.validator.body("id").isEmpty(),
    middleware.validator.body("houseInfo").isObject(),
    middleware.validator.body("people").isNumeric(),
    middleware.validator.body("price").isNumeric(),
    middleware.validator.body("title").isString(),
    middleware.validator.body("photo").isArray(),
    middleware.validator.body("contact").isObject(),
    middleware.validator.body("houseDescription").isString(),
    middleware.validator.body("equipmentAndServices").isObject(),
    middleware.validator.body("address").isString(),
    middleware.validator.body("isRented").isString(),
    middleware.validator.body("rentInfo").isObject(),
    middleware.validator.body("isRemoved").isBoolean(),
    middleware.inspector,
    async (_, res) => {
        // 取得文章的 Model
        const House = ctx.database.model("House", schema.house);
        // 建立新的文章
        const house = new House(res.body);
        // 強制設定 isRemoved 為 false
        house.isRemoved = false;
        // 強制設定 authorId 為 作者 id
        house.authorId = req.authenticated.sub;
        // 儲存文章
        if (await house.save()) {
            // 如果儲存成功，將回傳 CREATED
            res.sendStatus(StatusCodes.CREATED);
        } else {
            // 如果儲存失敗，將回傳 INTERNAL_SERVER_ERROR
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
);

// 修改房屋
app.put(
    "/house",
    middleware.access(null),
    middleware.validator.body("id").isEmpty(),
    middleware.validator.body("authorId").isEmpty(),
    middleware.validator.body("houseInfo").isObject(),
    middleware.validator.body("people").isNumeric(),
    middleware.validator.body("price").isNumeric(),
    middleware.validator.body("title").isString(),
    middleware.validator.body("photo").isArray(),
    middleware.validator.body("contact").isObject(),
    middleware.validator.body("houseDescription").isString(),
    middleware.validator.body("equipmentAndServices").isObject(),
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
        // 如果房屋作者與請求者id不同，則顯示錯誤
        if (!house.authorId === req.authenticated.sub) {
            res.sendStatus(StatusCodes.BAD_REQUEST)
            return;
        }
        // 檢查該房屋是否存在
        if (!house || house.isRemoved) {
            // 如果沒有找到該房屋，或已標示為被刪除的，將回傳 NOT_FOUND，並且結束函式
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        // 將資料更新到該房屋
        house = { ...house, ...req.body };
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
    }
);

// 刪除房屋
app.delete(
    "/house",
    middleware.access(null),
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
        // 如果房屋作者與請求者id不同，則顯示錯誤
        if (!house.authorId === req.authenticated.sub) {
            res.sendStatus(StatusCodes.BAD_REQUEST)
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
    }
);

// 建立使用者
app.post(
    "/register",
    middleware.validator.body("id").isEmpty(),
    middleware.validator.body("username").isString(),
    middleware.validator.body("password").isString(),
    middleware.validator.body("favoriteArticleIds").isEmpty(),
    middleware.validator.body("favoriteHouseIds").isEmpty(),

    middleware.inspector,
    async (req, res) => {
        // 取得文章的 Model
        const User = ctx.database.model("User", schema.User);
        req.body.password = util.hash.sha256(req.body.password);
        // 建立新的文章
        const user = new User(req.body);
        // 強制設定 favoriteArticleIds 為 null
        user.favoriteArticleIds = null;
        // 強制設定 favoriteHouseIds 為 null
        user.favoriteHouseIds = null;
        // 儲存文章
        if (await user.save()) {
            // 如果儲存成功，將回傳 CREATED
            res.sendStatus(StatusCodes.CREATED);
        } else {
            // 如果儲存失敗，將回傳 INTERNAL_SERVER_ERROR
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
);

// 查詢使用者
app.get(
    "/login",
    middleware.validator.query("username").isString(),
    middleware.validator.query("password").isString(),
    middleware.inspector,
    async (req, res) => {
        // 取得使用者的 Model
        const User = ctx.database.model("User", schema.user);
        // 透過 username 取得該帳號
        const user = User.findOne({ username: req.body.username });

        // 檢查該篇帳號是否存在
        if (!user || user.isRemoved) {
            // 如果沒有找到該篇帳號，或已標示為被刪除的，將回傳 NOT_FOUND，並且結束函式
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        const password = util.hash.sha256(req.body.password);

        // 檢查該篇密碼是否正確
        if (!(password === user.password)) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            //如果密碼錯誤，將回傳 UNAUTHORIZED，並且結束函式
            return;
        }

        // 回傳該帳戶
        res.send(user);
    }
);


// 啟動伺服器
app.listen(process.env.HTTP_PORT, process.env.HTTP_HOSTNAME, () => {
    console.log(constant.APP_NAME);
    console.log("====");
    console.log("Application is listening at");
    console.log(`http://localhost:${process.env.HTTP_PORT}`);
});
