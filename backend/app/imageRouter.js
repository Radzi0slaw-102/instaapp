const jsonController = require("./jsonController") //obsługa zapisu danych w jsonie
const fileController = require("./fileControler") //obsługa zdjęć
const getRequestData = require("./getRequestData") //przekształcanie danych wysłanych POST'em lub PATCH'em
const userController = require('./userController')
const formidable = require('formidable')

const router = async (request, response) => {
    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        // czytam dane z nagłowka 
        let token = request.headers.authorization.split(" ")[1]
        let answer = await userController.verifyToken(token)
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
        } else {
            if (request.url == "/api/photos") {
                switch (request.method) {
                    case "GET":
                        let serverAnswerAG = JSON.stringify(await jsonController.getAll())
                        if (JSON.parse(serverAnswerAG).length == 0) {
                            response.writeHead(404, { 'Content-Type': 'application/json' })
                            serverAnswerAG = JSON.stringify({
                                status: 404,
                                message: "no photos found"
                            })
                        } else {
                            response.writeHead(201, { 'Content-Type': 'application/json' })
                        }
                        response.end(serverAnswerAG)
                        break
                    case "POST":
                        let form = formidable({})
                        console.log(answer.username)
                        let answerAP = await fileController.uploadPhoto(form, request, answer.username)
                        answerAP = JSON.parse(answerAP)
                        answerAP.authorFullname = answer.fullname
                        answerAP.authorAvatar = answer.profileURL
                        let serverAnswerAP = jsonController.add(answerAP)
                        response.writeHead(201, { 'Content-Type': 'application/json' })
                        response.end(JSON.stringify(serverAnswerAP))
                        break
                }
            } else if (request.url == "/api/photos/tags") {
                switch (request.method) {
                    case "PATCH":
                        let data = await getRequestData(request)
                        let serverAnswerOP = JSON.stringify(jsonController.getOne(JSON.parse(data).id))
                        if (JSON.parse(serverAnswerOP).status == 404) {
                            response.writeHead(404, { 'Content-Type': 'application/json' })
                            response.end(serverAnswerOP)
                        } else {
                            let serverAnswerAddTag = JSON.stringify(jsonController.addTag(data))
                            if (JSON.parse(serverAnswerOP).status == 418) {
                                response.writeHead(418, { 'Content-Type': 'application/json' })
                            } else {
                                response.writeHead(201, { 'Content-Type': 'application/json' })
                            }
                            response.end(serverAnswerAddTag)
                        }
                        break
                }
            } else if (request.url == "/api/photos/tags/mass") {
                switch (request.method) {
                    case "PATCH":
                        let data = await getRequestData(request)
                        let serverAnswerOP = JSON.stringify(jsonController.getOne(JSON.parse(data).id))
                        if (JSON.parse(serverAnswerOP).status == 404) {
                            response.writeHead(404, { 'Content-Type': 'application/json' })
                            response.end(serverAnswerOP)
                        } else {
                            let serverAnswerAddTag = JSON.stringify(jsonController.addTags(data))
                            if (JSON.parse(serverAnswerOP).status == 418) {
                                response.writeHead(418, { 'Content-Type': 'application/json' })
                            } else {
                                response.writeHead(201, { 'Content-Type': 'application/json' })
                            }
                            response.end(serverAnswerAddTag)
                        }
                        break
                }
            } else if (request.url == "/api/photos/albums") {
                let albumsArray = jsonController.getUserAlbums(answer.username)
                response.writeHead(200, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(albumsArray))
            } else if (request.url.match(/\/api\/photos\/tags\/([0-9a-z]+)/)) {
                switch (request.method) {
                    case "GET":
                        let idTagGArray = request.url.split("/")
                        let idTagG = idTagGArray[idTagGArray.length - 1]
                        let serverAnswerOG = JSON.stringify(jsonController.getTags(idTagG))
                        if (JSON.parse(serverAnswerOG).status == 404) {
                            response.writeHead(404, { 'Content-Type': 'application/json' })
                        } else {
                            response.writeHead(201, { 'Content-Type': 'application/json' })
                        }
                        response.end(serverAnswerOG)
                        break
                }
            } else if (request.url.match(/\/api\/photos\/([0-9a-zA-Z$]+)\/([0-9a-zA-Z$]+)/)) {
                let array = request.url.split("/")
                let username = array[array.length - 2]
                let album = array[array.length - 1]
                console.log(username, album)
                let answerPhotos = jsonController.getAllThatMatch(username, album)
                response.writeHead(200, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(answerPhotos))
            } else if (request.url.match(/\/api\/photos\/([0-9a-z]+)/)) {
                switch (request.method) {
                    case "GET":
                        let idOGArray = request.url.split("/")
                        let idOG = idOGArray[idOGArray.length - 1]
                        let serverAnswerOG = await jsonController.getOne(idOG)
                        response.writeHead(200)
                        response.end(serverAnswerOG)
                        break
                    case "DELETE":
                        let idODArray = request.url.split("/")
                        let idOD = idODArray[idODArray.length - 1]
                        let serverAnswerOD = await fileController.deletePhoto(idOD)
                        if (JSON.parse(serverAnswerOD).status == 404) {
                            response.writeHead(404, { 'Content-Type': 'application/json' })
                        } else {
                            serverAnswerOD = JSON.stringify(jsonController.delete(serverAnswerOD))
                            response.writeHead(201, { 'Content-Type': 'application/json' })
                        }
                        response.end(serverAnswerOD)
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
    }
}

module.exports = router