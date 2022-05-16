'use strict';


require('dotenv').config();

const {StatusCodes} = require('http-status-codes');

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
    schema = {
        article: require('./src/schemas/Article')
    },
    middleware = {
        validator: require('express-validator'),
        file_upload: require('express-fileupload'),
        access: require('./src/middlewares/access'),
        inspector: require('./src/middlewares/inspector')
    };

const app = require('./src/init/express')(ctx);

app.get('/', (req, res) => {
    res.redirect(StatusCodes.MOVED_PERMANENTLY, process.env.WEBSITE_URL);
});

app.get('/ip', (req, res) => {
    res.send({ip_address: util.ip_address(req)});
});

app.get('/articles',
    middleware.validator.query('page').isNumeric(),
    middleware.inspector,
    async (req, res) => {
        const Article = ctx.database.model('Article', schema.article);
        const page_int = parseInt(req.query.page);
        const page = page_int > 0 ? page_int - 1 : 0;
        const articles = await Article.find({
            isRemoved: false
        }).skip(page * 10).limit(10).exec();
        res.send({articles});
    }
)

app.get('/article',
    middleware.validator.query('id').isString(),
    middleware.inspector,
    async (req, res) => {
        const Article = ctx.database.model('Article', schema.article);
        let article;
        try {
            article = await Article.findById(req.query.id).exec();
        } catch (e) {
            if (e.kind !== 'ObjectId') console.error(e);
            res.sendStatus(StatusCodes.BAD_REQUEST);
            return;
        }
        if (!article || article.isRemoved) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        res.send(article);
    }
)

app.post('/article',
    middleware.validator.body('id').isEmpty(),
    middleware.validator.body('people').isNumeric(),
    middleware.validator.body('price').isNumeric(),
    middleware.validator.body('contact').isObject(),
    middleware.validator.body('condition').isArray(),
    middleware.validator.body('area').isString(),
    middleware.validator.body('isFound').isEmpty(),
    middleware.inspector,
    async (req, res) => {
        const Article = ctx.database.model('Article', schema.article);
        const article = new Article(res.body);
        article.isFound = false;
        if (await article.save()) {
            res.sendStatus(StatusCodes.CREATED);
        } else {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
)

app.put('/article',
    middleware.validator.body('id').isString(),
    middleware.validator.body('people').isNumeric(),
    middleware.validator.body('price').isNumeric(),
    middleware.validator.body('contact').isObject(),
    middleware.validator.body('condition').isArray(),
    middleware.validator.body('area').isString(),
    middleware.validator.body('isFound').isBoolean(),
    middleware.inspector,
    async (req, res) => {
        const Article = ctx.database.model('Article', schema.article);
        let article;
        try {
            article = await Article.findById(req.body.id).exec();
        } catch (e) {
            if (e.kind !== 'ObjectId') console.error(e);
            res.sendStatus(StatusCodes.BAD_REQUEST);
            return;
        }
        if (!article || article.isRemoved) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        article = {...article, ...req.body};
        if (await article.save()) {
            res.sendStatus(StatusCodes.NO_CONTENT);
        } else {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
)

app.delete('/article',
    middleware.validator.query('id').isString(),
    middleware.inspector,
    async (req, res) => {
        const Article = ctx.database.model('Article', schema.article);
        let article;
        try {
            article = await Article.findById(req.query.id).exec();
        } catch (e) {
            if (e.kind !== 'ObjectId') console.error(e);
            res.sendStatus(StatusCodes.BAD_REQUEST);
            return;
        }
        if (!article) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }
        if (!article.isRemoved) {
            article.isRemoved = true;
            await article.save();
            res.sendStatus(StatusCodes.NO_CONTENT);
        } else if (await article.delete()) {
            res.sendStatus(StatusCodes.NO_CONTENT);
        } else {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
)

app.post('/house/photo', middleware.file_upload({
    limits: {fileSize: 50 * 1024 * 1024},
}), (req, res) => {
    if (!req.files?.file) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
        return;
    }
    res.sendStatus(StatusCodes.SERVICE_UNAVAILABLE);
})

app.listen(process.env.HTTP_PORT, process.env.HTTP_HOSTNAME, () => {
    console.log(constant.APP_NAME)
    console.log('====')
    console.log('Application is listening at')
    console.log(`http://localhost:${process.env.HTTP_PORT}`)
});
