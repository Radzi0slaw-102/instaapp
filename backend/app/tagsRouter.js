const tagsController = require("./tagsController") //obsługa tagów 
const jsonController = require("./jsonController") //obsługa zapisu danych w jsonie
const fileController = require("./fileControler") //obsługa zdjęć
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
    if (request.url == "/api/tags") {
        switch (request.method) {
            case "GET":
                let serverAnswerAG = JSON.stringify(tagsController.getAllTagsExt())
                response.writeHead(201, { 'Content-Type': 'application/json' })
                response.end(serverAnswerAG)
                break
            case "POST":
                let data = await getRequestData(request)
                let serverAnswerAdd = JSON.stringify(tagsController.add(data))
                if (JSON.parse(serverAnswerAdd).status == 418) {
                    response.writeHead(418, { 'Content-Type': 'application/json' })
                } else {
                    response.writeHead(201, { 'Content-Type': 'application/json' })
                }
                response.end(serverAnswerAdd)
                break
        }
    } else if (request.url == "/api/tags/raw") {
        switch (request.method) {
            case "GET":
                let serverAnswerRaw = JSON.stringify(tagsController.getAllTagsRaw())
                response.writeHead(201, { 'Content-Type': 'application/json' })
                response.end(serverAnswerRaw)
                break
        }
    } else if (request.url.match(/\/api\/tags\/([0-9a-z]+)/)) {
        switch (request.method) {
            case "GET":
                let idOGArray = request.url.split("/")
                let idOG = idOGArray[idOGArray.length - 1]
                let serverAnswerOG = JSON.stringify(tagsController.getOne(idOG))
                if (JSON.parse(serverAnswerOG).status == 404) {
                    response.writeHead(404, { 'Content-Type': 'application/json' })
                } else {
                    response.writeHead(201, { 'Content-Type': 'application/json' })
                }
                response.end(serverAnswerOG)
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