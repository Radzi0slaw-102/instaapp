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
    if (request.url == "/api/setup") {
        switch (request.method) {
            case "GET":
                await jsonController.setupExistingUsers()
                await jsonController.setupExistingPhotos()
                let answer = {
                    status: 201,
                    reason: "success"
                }
                response.writeHead(201, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(answer))
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