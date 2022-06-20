"use strict";

// Import supertest
const request = require("supertest");

// Import StatusCodes
const {StatusCodes} = require("http-status-codes");

// Initialize tests
const {app, readToken} = require("./init");

const createData1 = {
    houseInfo: {
        houseSize: 10,
        houseType: "公寓大樓",
        roomType: "整層住家",
        room: {
            房間: 2,
            衛浴: 2,
            大廳: 1,
        }
    },
    price: 3000,
    depositMethod: "一個月",
    rentIncludes: ["管理費"],
    houseFace: "坐北朝南",
    title: "精美整層房屋",
    contact: {
        lineID: " idiotooooo",
        phoneNumber: "0911-111-111"
    },
    houseDescription: "我喜歡好的房客，就會有好的租客",
    equipmentAndServices: {
        condition: ['學生'],
        houseRule: null,
        equipment: ['床', '書桌', '冰箱', '冷氣', '熱水器',],
        service: ['網路', '第四台'],
        publicUtilities: ['游泳池']
    },
    address: {
        city: "高雄市",
        township: "仁武區",
        others: "鳳仁路95之21號"
    },
    isRented: "否",
    rentInfo: {
        date: "2022-07-01",
        atLeastTime: "3個月 "
    },
    isRemoved: false
}

const createData2 = {
    houseInfo: {
        houseSize: 22,
        houseType: "公寓大樓",
        roomType: "獨立套房",
        room: {
            房間: 3,
            衛浴: 1,
            大廳: 1,
        }
    },
    price: 12000,
    depositMethod: "面議",
    rentIncludes: ["管理費", "網路", "瓦斯費"],
    houseFace: "坐北朝南",
    title: "超棒房子一號",
    contact: {
        lineID: "LineIDNumber1",
        phoneNumber: "0984654305"
    },
    houseDescription: "超級棒房子",
    equipmentAndServices: {
        condition: ['男女皆可', 'student', 'officeWorker', 'year'],
        houseRule: ['可養寵', '可開火'],
        equipment: ['床', '書桌', '冰箱', '冷氣', '熱水器', '電視'],
        service: ['管理室', '回收室', '網路', '第四台', '電梯', '車位'],
        publicUtilities: ['游泳池', '視聽室']
    },
    address: {
        city: '台東縣',
        township: '台東市',
        others: '寧波街55巷32弄9號'
    },
    isRented: '否',
    rentInfo: {
        date: '2020-06-04',
        atLeastTime: '1年'
    },
    isRemoved: false
}
const searchData = {
    houseInfo: {
        houseType: "公寓大樓",
        roomType: "獨立套房",
        room: {
            房間: 3,
            衛浴: 1,
            大廳: 1,
        }
    },
    price: [0, 20000],
    rentIncludes: ["管理費", "網路", "瓦斯費"],
    equipmentAndServices: {
        condition: ['男女皆可', 'student', 'officeWorker', 'year'],
        houseRule: ['可養寵', '可開火'],
        equipment: ['床', '書桌', '冰箱', '冷氣', '熱水器', '電視'],
        service: ['管理室', '回收室', '網路', '第四台', '電梯', '車位'],
        publicUtilities: ['游泳池', '視聽室']
    },
    address: {
        city: '台東縣',
        township: '台東市',
    },
}

describe("/house/list", function () {
    it("search house page", function (done) {
        request(app)
            .get("/house/list")
            .query({page: 1})
            .set("Accept", "application/json")
            .expect(StatusCodes.OK)
            .end((err, res) => {
                console.log(res.body);
                done(err);
            });
    });
});

// Define tests
describe("/house", function () {
    // Read token from test.key
    const authToken = readToken();

    let id;

    it("create a house", function (done) {
        request(app)
            .post("/house")
            .send(createData2)
            .set("Accept", "application/json")
            .set("Authorization", `ATARI ${authToken}`)
            .expect(StatusCodes.CREATED)
            .end((err, res) => {
                console.log(res.body);
                id = res.body._id;
                done(err);
            });
    });
    it("get house", function (done) {
        request(app)
            .get("/house")
            .query({id})
            .set("Accept", "application/json")
            .expect(StatusCodes.OK)
            .end((err, res) => {
                console.log(res.body);
                done(err);
            });
    });
    it("modify house", function (done) {
        request(app)
            .post("/house")
            .send(createData2)
            .set("Accept", "application/json")
            .set("Authorization", `ATARI ${authToken}`)
            .expect(StatusCodes.CREATED)
            .end((err, res) => {
                console.log(res.body);
                done(err);
            });
    });
    it("delete house", function (done) {
        request(app)
            .get("/house")
            .query({id})
            .set("Accept", "application/json")
            .expect(StatusCodes.OK)
            .end((err, res) => {
                console.log(res.body);
                done(err);
            });
    });
});

