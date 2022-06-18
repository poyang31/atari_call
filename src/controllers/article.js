const {StatusCodes} = require("http-status-codes");
const {Router: expressRouter} = require("express");

// Import modules
const schema = {
    article: require("../schemas/article"),
};
const middleware = {
    inspector: require("../middlewares/inspector"),
    validator: require("express-validator"),
};

// Export routes mapper (function)
module.exports = (ctx, r) => {
    const router = expressRouter();

    // 取得文章列表
    router.get(
        "/articles",
        middleware.validator.query("page").isNumeric(),
        middleware.inspector,
        async (req, res) => {
            // 取得文章的 Model
            const Article = ctx.database.model("Article", schema.article);
            // 解析 page 為數字（int）
            const pageInt = parseInt(req.query.page);
            // 運算 page 的起始索引
            const page = pageInt > 0 ? pageInt - 1 : 0;
            // 取得未標示為被刪除的的文章列表
            const articles = await Article.find({
                isRemoved: false,
            })
                .skip(page * 10)
                .limit(10)
                .exec();
            // 回傳文章列表
            res.send(articles);
        },
    );

    // 查詢文章
    router.get(
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
        },
    );

    // 建立文章
    router.post(
        "/article",
        middleware.validator.body("id").isEmpty(),
        middleware.validator.body("people").isNumeric(),
        middleware.validator.body("price").isNumeric(),
        middleware.validator.body("title").isString(),
        middleware.validator.body("contact").isObject(),
        middleware.validator.body("condition").isArray(),
        middleware.validator.body("area").isObject(),
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
        },
    );

    // 修改文章
    router.put(
        "/article",
        middleware.validator.body("id").isString(),
        middleware.validator.body("people").isNumeric(),
        middleware.validator.body("price").isNumeric(),
        middleware.validator.body("title").isString(),
        middleware.validator.body("contact").isObject(),
        middleware.validator.body("condition").isArray(),
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
            // 檢查該篇文章是否存在
            if (!article || article.isRemoved) {
                // 如果沒有找到該篇文章，或已標示為被刪除的，將回傳 NOT_FOUND，並且結束函式
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }
            // 將資料更新到該篇文章
            article = {...article, ...req.body};
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
        },
    );

    // 刪除文章
    router.delete(
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
        },
    );

    r.use("/article", router);
};
