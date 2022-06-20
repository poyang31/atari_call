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
    const userData = {
        lastName: 'test_lastName',
        firstName: 'test_firstName',
        nickname: 'test_nickname',
        lineId: 'test_lineId',
        phone: 'test_phone',
    };

    let userId;

    it("get profile", function (done) {
        request(app)
            .get("/profile")
            .set("Accept", "application/json")
            .set("Authorization", `ATARI ${authToken}`)
            .expect(StatusCodes.OK)
            .then((res) => {
                console.log(res.body);
                userId = res.body._id;
                done();
            })
            .catch((err) => done(err));
    });

    it("modify profile", function (done) {
        request(app)
            .put("/profile")
            .send({id: userId, ...userData})
            .set("Accept", "application/json")
            .set("Authorization", `ATARI ${authToken}`)
            .expect(StatusCodes.NO_CONTENT)
            .then((res) => {
                console.log(res.body);
                done();
            })
            .catch((err) => done(err));
    });
});
