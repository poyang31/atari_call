"use strict";

// Import supertest
const request = require("supertest");

// Import StatusCodes
const {StatusCodes} = require("http-status-codes");

// Initialize tests
const {app, readToken} = require("./init");

// Define tests
describe("/profile", function () {
    // Read token from test.key
    const authToken = readToken();

    it("get profile", function (done) {
        request(app)
            .get("/profile")
            .set("Accept", "application/json")
            .set("Authorization", `ATARI ${authToken}`)
            .expect(StatusCodes.OK)
            .then((res) => {
                console.log(res.body);
                done();
            })
            .catch((err) => done(err));
    });

    it("modifyProfile", function (done) {
        request(app)
            .get("/profile")
            .set("Accept", "application/json")
            .set("Authorization", `ATARI ${authToken}`)
            .expect(StatusCodes.OK)
            .then((res) => {
                console.log(res.body);
                done();
            })
            .catch((err) => done(err));
    });
});

