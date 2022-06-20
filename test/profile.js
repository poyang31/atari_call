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

const userdata = {
    lastName: 'test_lastName',
    firstName: 'test_firstName',
    nickname: 'test_nickname',
    lineId: 'test_lineId',
    phone: 'test_phone',
  }

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

    it("modify profile", function (done) {
        request(app)
            .put("/profile")
            .send({id: "62b0284972befe5df6c48921",...userdata})
            .set("Accept", "application/json")
            .set("Authorization", `ATARI ${authToken}`)
            .expect(StatusCodes.CREATED)
            .then((res) => {
                console.log(res.body);
                done();
            })
            .catch((err) => done(err));
    });
});

