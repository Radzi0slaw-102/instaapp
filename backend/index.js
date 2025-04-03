const http = require('http');
const imageRouter = require("./app/imageRouter")
const tagsRouter = require("./app/tagsRouter")
const userRouter = require("./app/userRouter")
const profileRouter = require("./app/profileRouter")
const tokenRouter = require("./app/tokenRouter")
const setupRouter = require('./app/setupRouter')
require("dotenv").config()

http
    .createServer(async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        if (req.url.search("/api/setup") != -1) {
            await setupRouter(req, res)
        } else if (req.url.search("/api/token") != -1) {
            await tokenRouter(req, res)
        } else if (req.url.search("/api/photos") != -1) {
            await imageRouter(req, res)
        }
        else if (req.url.search("/api/tags") != -1) {
            await tagsRouter(req, res)
        }
        else if (req.url.search("/api/user") != -1) {
            await userRouter(req, res)
        }
        else if (req.url.search("/api/profile") != -1) {
            await profileRouter(req, res)
        }
    })
    .listen(process.env.APP_PORT, () => console.log(`listen on ${process.env.APP_PORT}`))