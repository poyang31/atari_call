'use strict';


require('dotenv').config();

const { StatusCodes } = require('http-status-codes');

const
    constant = require('./src/init/const'),
    ctx = {
        now: () => Math.floor(new Date().getTime() / 1000),
        cache: require('./src/init/cache'),
        database: require('./src/init/database'),
        jwt_secret: require('./src/init/jwt_secret')
    },
    util = {
        ip_address: require('./src/utils/ip_address')
    },
    schema = {},
    middleware = {
        file_upload: require('express-fileupload'),
        access: require('./src/middlewares/access'),
    };

const app = require('./src/init/express')(ctx);

app.get('/', (req, res) => {
    res.redirect(StatusCodes.MOVED_PERMANENTLY, process.env.WEBSITE_URL);
});

app.get('/ip', (req, res) => {
    res.send({ip_address: util.ip_address(req)});
});

app.post('/house/photo', middleware.file_upload({
    limits: { fileSize: 50 * 1024 * 1024 },
}), (req, res) => {
    if (!req.files?.file) {
        res.sendStatus(StatusCodes.BAD_REQUEST)
    }
})


app.listen(process.env.HTTP_PORT, process.env.HTTP_HOSTNAME, () => {
    console.log(constant.APP_NAME)
    console.log('====')
    console.log('Application is listening at')
    console.log(`http://localhost:${process.env.HTTP_PORT}`)
});
