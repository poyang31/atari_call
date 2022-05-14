"use strict";

module.exports = (req) => req?.clientIp || req.ip;
