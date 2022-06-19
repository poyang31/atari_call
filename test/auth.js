"use strict";

// Import supertest
const request = require("supertest");

// Import StatusCodes
const {StatusCodes} = require("http-status-codes");

// Initialize tests
const {app, ctx, saveToken} = require("./init");

// Define tests
describe("POST /register", function () {
    before((done) => {
        // Reset database before register
        ctx.database.connection.dropDatabase(() => done());
    });
    it("register a user", function (done) {
        request(app)
            .post("/register")
            .send({
                username: "test",
                password: "test_password",
            })
            .set("Accept", "application/json")
            .expect(StatusCodes.CREATED)
            .then((res) => {
                console.log(res.body);
                saveToken(res.body.authToken);
                done();
            })
            .catch((err) => done(err));
    });
});

describe("POST /login", function () {
    it("do a login", function (done) {
        request(app)
            .post("/login")
            .send({
                username: "test",
                password: "test_password",
            })
            .set("Accept", "application/json")
            .expect(StatusCodes.OK)
            .then((res) => {
                console.log(res.body);
                saveToken(res.body.authToken);
                done();
            })
            .catch((err) => done(err));
    });
});
