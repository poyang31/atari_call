const {StatusCodes} = require("http-status-codes");

// Import modules
const schema = {
    user: require("../schemas/user"),
};
const util = {
    hash: require("js-sha256"),
};
const middleware = {
    inspector: require("../middlewares/inspector"),
    validator: require("express-validator"),
};

// Export routes mapper (function)
module.exports = (ctx, r) => {
    // 登入
    r.post(
        "/login",
        middleware.validator.body("username").isString(),
        middleware.validator.body("password").isString(),
        middleware.inspector,
        async (req, res) => {
            // 將密碼進行 SHA-256 雜湊
            req.body.password = util.hash.sha256(req.body.password);
            // 取得使用者的 Model
            const User = ctx.database.model("User", schema.user);
            // 透過 username 取得使用者
            const user = User.findOne({username: req.body.username});
            // 檢查使用者是否存在
            if (!user) {
                // 如果沒有找到使用者，將回傳 NOT_FOUND，並且結束函式
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }
            // 檢查密碼是否正確
            if (req.body.password !== user.password) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                // 如果密碼錯誤，將回傳 UNAUTHORIZED，並且結束函式
                return;
            }
            // 回傳該帳戶
            res.send(user);
        },
    );

    // 註冊
    r.post(
        "/register",
        middleware.validator.body("id").isEmpty(),
        middleware.validator.body("username").isString(),
        middleware.validator.body("password").isString(),
        middleware.validator.body("favoriteArticleIds").isEmpty(),
        middleware.validator.body("favoriteHouseIds").isEmpty(),
        middleware.inspector,
        async (req, res) => {
            // 將密碼進行 SHA-256 雜湊
            req.body.password = util.hash.sha256(req.body.password);
            // 取得使用者的 Model
            const User = ctx.database.model("User", schema.user);
            // 建立新的使用者
            const user = new User(req.body);
            // 強制設定 favoriteArticleIds 為 []
            user.favoriteArticleIds = [];
            // 強制設定 favoriteHouseIds 為 []
            user.favoriteHouseIds = [];
            // 儲存使用者
            if (await user.save()) {
                // 如果儲存成功，將回傳 CREATED
                res.sendStatus(StatusCodes.CREATED);
            } else {
                // 如果儲存失敗，將回傳 INTERNAL_SERVER_ERROR
                res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        },
    );
};
