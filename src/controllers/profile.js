"use strict";

const {Router: expressRouter} = require("express");

const schema = {
    user: require("../schemas/user"),
};

const {StatusCodes} = require("http-status-codes");

// Import modules
const middleware = {
    access: require("../middlewares/access"),
    inspector: require("../middlewares/inspector"),
    validator: require("express-validator"),
};

// Export routes mapper (function)
module.exports = (ctx, r) => {
    const router = expressRouter();

    router.get(
        "/",
        middleware.access,
        (req, res) => res.send(req.auth.metadata.user),
    );

    router.put(
        "/",
        middleware.access,
        middleware.validator.body("password").isEmpty(),
        middleware.validator.body("lastName").isString().notEmpty(),
        middleware.validator.body("firstName").isString().notEmpty(),
        middleware.validator.body("nickname").isString().notEmpty(),
        middleware.validator.body("lineId").isString().notEmpty(),
        middleware.validator.body("phone").isString().notEmpty(),
        middleware.inspector,
        async (req, res) => {
            // 取得使用者的 Model
            const User = ctx.database.model("User", schema.user);
            // 透過 id 取得使用者
            let user;
            try {
                user = await User.findById(req.body.id).exec();
            } catch (e) {
                if (e.kind !== "ObjectId") console.error(e);
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            // 檢查使用者是否存在
            if (!user) {
                // 如果沒有找到使用者，將回傳 NOT_FOUND，並且結束函式
                res.sendStatus(StatusCodes.NOT_FOUND);
                return;
            }
            // 將資料更新到使用者
            user = {...user, ...req.body};
            // 儲存使用者
            if (await user.save()) {
                // 如果儲存成功，將回傳 OK
                res.sendStatus(StatusCodes.NO_CONTENT);
            } else {
                // 如果儲存失敗，將回傳 INTERNAL_SERVER_ERROR
                res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        },
    );

    r.use("/profile", router);
};
