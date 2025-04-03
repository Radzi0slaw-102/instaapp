const tagsController = require("./tagsController") //obsługa tagów 
const jsonController = require("./jsonController") //obsługa zapisu danych w jsonie
const fileController = require("./fileControler") //obsługa zdjęć
const userController = require("./userController") // obsługa logowania i rejestracji
const getRequestData = require("./getRequestData") //przekształcanie danych wysłanych POST'em
const model = require('./model') //klasa Photo i tablica
const logger = require('tracer').colorConsole()
const formidable = require('formidable')

// logger.log('hello');
// logger.trace('hello');
// logger.debug('hello');
// logger.info('hello');
// logger.warn('hello');
// logger.error('hello');

const router = async (request, response) => {
    if (request.url == "/api/token") {
        switch (request.method) {
            case "POST":
                let data = await getRequestData(request)
                let answer = await userController.verifyToken(data)
                if (answer == 'jwt expired') {
                    let serverAnswer = {
                        status: 408,
                        message: "token expired"
                    }
                    response.writeHead(408, { "Content-Type": "application/json" })
                    response.end(JSON.stringify(serverAnswer))
                } else if (answer == 'invalid token') {
                    let serverAnswer = {
                        status: 401,
                        message: "invalid token"
                    }
                    response.writeHead(401, { "Content-Type": "application/json" })
                    response.end(JSON.stringify(serverAnswer))
                } else if (answer.email !== undefined) {
                    let confirmed = jsonController.checkIfUserVerified(answer.email)
                    if (confirmed) {
                        let serverAnswer = {
                            status: 201,
                            message: "valid token"
                        }
                        response.writeHead(201, { "Content-Type": "application/json" })
                        response.end(JSON.stringify(serverAnswer))
                    } else {
                        let serverAnswer = {
                            status: 401,
                            message: "user unverified"
                        }
                        response.writeHead(401, { "Content-Type": "application/json" })
                        response.end(JSON.stringify(serverAnswer))
                    }
                } else {
                    let serverAnswer = {
                        status: 401,
                        message: "unknown error"
                    }
                    response.writeHead(401, { "Content-Type": "application/json" })
                    response.end(JSON.stringify(serverAnswer))
                }
                break
        }
    } else {
        let answer = {
            status: 404,
            reason: "site not found"
        }
        response.writeHead(404, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(answer))
    }
}

module.exports = router