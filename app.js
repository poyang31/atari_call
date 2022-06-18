"use strict";

// 載入 .env 檔案
require("dotenv").config();

// HTTP 狀態碼常數表
const {StatusCodes} = require("http-status-codes");

// 載入模組
const constant = require("./src/init/const");
const ctx = {
    now: () => Math.floor(new Date().getTime() / 1000),
    cache: require("./src/init/cache"),
    database: require("./src/init/database"),
    jwt_secret: require("./src/init/jwt_secret"),
};
const util = {
    ip_address: require("./src/utils/ip_address"),
};

// 初始化 express 實例
const app = require("./src/init/express")(ctx);

// 初始化 Swagger 實例
const swagger = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// 將 API 首頁轉址到前端頁面
app.get("/", (_, res) => {
    res.redirect(StatusCodes.MOVED_PERMANENTLY, process.env.WEBSITE_URL);
});

// 處理 robots.txt 請求（拒絕所有友善機器人）
app.get(
    "/robots.txt",
    (_, res) => res.type("txt").send("User-agent: *\nDisallow: /"),
);

// API 文檔頁面
app.use("/docs", swagger.serve, swagger.setup(swaggerDocument));

// 取得使用者 IP 位置（測試網路狀態）
app.get("/ip", (req, res) => {
    res.send({ip_address: util.ip_address(req)});
});

// 部屬路徑（載入控制器）
require("./src/controllers/index")(ctx, app);

// 啟動伺服器
// Show status message
(() => {
    const nodeEnv = process.env.NODE_ENV;
    const runtimeEnv = process.env.RUNTIME_ENV || "native";
    console.log(
        constant.APP_NAME,
        `(runtime: ${nodeEnv}, ${runtimeEnv})`,
        "\n====",
    );
})();
// Mount application and execute it
require("./src/execute")(app, ({type, hostname, port}) => {
    const protocol = type === "general" ? "http" : "https";
    console.log(`Protocol "${protocol}" is listening at`);
    console.log(`${protocol}://${hostname}:${port}`);
});
