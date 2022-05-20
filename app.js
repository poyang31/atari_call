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
        ip_address: require("./src/utils/ip_address"),
    },
    // 結構
    schema = {
        article: require("./src/schemas/Article"),
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
            isRemoved: false,
        })
            .skip(page * 10)
            .limit(10)
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
    middleware.validator.body("id").isEmpty(),
    middleware.validator.body("people").isNumeric(),
    middleware.validator.body("price").isNumeric(),
    middleware.validator.body("contact").isObject(),
    middleware.validator.body("condition").isArray(),
    middleware.validator.body("area").isString(),
    middleware.validator.body("isFound").isEmpty(),
    middleware.validator.body("isRemoved").isEmpty(),
    middleware.inspector,
    async (_, res) => {
        // 取得文章的 Model
        const Article = ctx.database.model("Article", schema.article);
        // 建立新的文章
        const article = new Article(res.body);
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
    middleware.validator.body("id").isString(),
    middleware.validator.body("people").isNumeric(),
    middleware.validator.body("price").isNumeric(),
    middleware.validator.body("contact").isObject(),
    middleware.validator.body("condition").isArray(),
    middleware.validator.body("area").isString(),
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

// 啟動伺服器
app.listen(process.env.HTTP_PORT, process.env.HTTP_HOSTNAME, () => {
    console.log(constant.APP_NAME);
    console.log("====");
    console.log("Application is listening at");
    console.log(`http://localhost:${process.env.HTTP_PORT}`);
});
