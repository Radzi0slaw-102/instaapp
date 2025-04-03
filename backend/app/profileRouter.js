const jsonController = require("./jsonController") //obsługa zapisu danych w jsonie
const fileController = require("./fileControler") //obsługa zdjęć
const userController = require("./userController") // obsługa logowania i rejestracji
const getRequestData = require("./getRequestData") //przekształcanie danych wysłanych POST'em
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
            if (request.url == "/api/profile") {
                switch (request.method) {
                    case "GET":
                        let serverAnswer = jsonController.getUserData(answer.email)
                        response.writeHead(201, { "Content-Type": "application/json" })
                        response.end(JSON.stringify(serverAnswer))
                        break
                    case "PATCH":
                        let oldEmail = answer.email
                        let oldUsername = answer.username
                        let data = await getRequestData(request)
                        data = JSON.parse(data)
                        console.log('Data: ', data)
                        let checkEmail
                        if (oldEmail != data.email && data.email != '') {
                            checkEmail = jsonController.getUserData(data.email)
                        }
                        if (checkEmail === undefined) {
                            let checkUsername
                            if (oldUsername != data.username && data.username != '') {
                                checkUsername = jsonController.getUsernameData(data.username)
                            }
                            if (checkUsername === undefined) {
                                let newData = jsonController.simpleUpdate(data, oldEmail)
                                if (newData.newUsername != '') {
                                    let directoryChange = await jsonController.changeUserFolderName(oldUsername, newData.newUsername)
                                    console.log('directoryChange', directoryChange)
                                    if (directoryChange == 'success') {
                                        jsonController.updatePhotosData(oldUsername, newData)
                                        let avDirChange = await jsonController.changeAvatarDirectory(oldUsername, newData.newUsername)
                                        console.log('avDirChange', avDirChange)
                                        if (avDirChange == 'success' || avDirChange == 'nothing happend') {
                                            let updateStatus = jsonController.updateUserAvatarDir(newData.newUsername)
                                            console.log('updateStatus', updateStatus)
                                            if (updateStatus == 'success') {
                                                let allNewUserData
                                                if (newData.newEmail != '') {
                                                    allNewUserData = jsonController.getUserData(newData.newEmail)
                                                } else {
                                                    allNewUserData = jsonController.getUserData(oldEmail)
                                                }
                                                let token = await userController.generateToken(allNewUserData)
                                                console.log('newToken: ', token)
                                                let answerUpdate = {
                                                    status: 200,
                                                    message: "data updated",
                                                    token: token
                                                }
                                                response.writeHead(200, { "Content-Type": "application/json" })
                                                response.end(JSON.stringify(answerUpdate))
                                            }
                                        }
                                    }
                                } else {
                                    let allNewUserData
                                    if (newData.newEmail != '') {
                                        allNewUserData = jsonController.getUserData(newData.newEmail)
                                    } else {
                                        allNewUserData = jsonController.getUserData(oldEmail)
                                    }
                                    let token = await userController.generateToken(allNewUserData)
                                    let answerUpdate = {
                                        status: 200,
                                        message: "data updated",
                                        token: token
                                    }
                                    response.writeHead(200, { "Content-Type": "application/json" })
                                    response.end(JSON.stringify(answerUpdate))
                                }
                            } else {
                                let answerUpdate = {
                                    status: 409,
                                    message: "user with this username already exists"
                                }
                                response.writeHead(409, { "Content-Type": "application/json" })
                                response.end(JSON.stringify(answerUpdate))
                            }
                        } else {
                            let answerUpdate = {
                                status: 409,
                                message: "user with this email already exists"
                            }
                            response.writeHead(409, { "Content-Type": "application/json" })
                            response.end(JSON.stringify(answerUpdate))
                        }
                        break
                }
            } else if (request.url == "/api/profile/updateAvatar") {
                if (request.method == 'PATCH') {
                    let form = formidable({})
                    let url = await fileController.uploadAvatar(form, request, answer.username)
                    let serverAnswer = {
                        message: jsonController.updateUserAvatar(url, answer.email),
                    }
                    let allNewUserData = jsonController.getUserData(answer.email)
                    serverAnswer.token = await userController.generateToken(allNewUserData)
                    response.writeHead(200, { "Content-Type": "application/json" })
                    response.end(JSON.stringify(serverAnswer))
                }
            } else if (request.url == "/api/profile/updateAvatarUrl") {
                if (request.method == 'PATCH') {
                    let data = await getRequestData(request)
                    data = JSON.parse(data)
                    let serverAnswer = {
                        message: jsonController.updateUserAvatar(data.url, answer.email),
                    }
                    let allNewUserData = jsonController.getUserData(answer.email)
                    serverAnswer.token = await userController.generateToken(allNewUserData)
                    response.writeHead(200, { "Content-Type": "application/json" })
                    response.end(JSON.stringify(serverAnswer))
                }
            } else if (request.url.match(/\/api\/profile\/([0-9a-z]+)/) && request.method == 'GET') {
                let usernameArray = request.url.split("/")
                let username = usernameArray[usernameArray.length - 1]
                let avatar = await jsonController.getProfilePic(username)
                if (avatar.message !== undefined) {
                    response.writeHead(404)
                } else {
                    response.writeHead(200)
                }
                response.end(avatar)
            } else {
                let answer = {
                    status: 404,
                    reason: "site not found"
                }
                response.writeHead(404, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(answer))
            }
        }
    } else {
        let answer = {
            status: 400,
            reason: "lack of token"
        }
        response.writeHead(400, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(answer))
    }
}
module.exports = router