const jsonController = require("./jsonController") //obsługa zapisu danych w jsonie
const userController = require("./userController") // obsługa logowania i rejestracji
const getRequestData = require("./getRequestData") //przekształcanie danych wysłanych POST'em

const router = async (request, response) => {
    console.log(request.url, request.method)
    if (request.url == "/api/users") {
        switch (request.method) {
            case "GET":
                let answer = jsonController.getAllUsers()
                response.writeHead(201, { "Content-Type": "application/json" })
                response.end(JSON.stringify(answer))
                break
        }
    } else if (request.url == "/api/user/login") {
        switch (request.method) {
            case "POST":
                let data = await getRequestData(request)
                data = JSON.parse(data)
                let userExist = jsonController.doesUserExist(data.email)
                if (userExist) {
                    let userData = jsonController.getUserData(data.email)
                    let actualPassword = userData.password
                    let isPasswordCorrect = await userController.decrypt(data.password, actualPassword)
                    if (isPasswordCorrect) {
                        let confirmed = jsonController.checkIfUserVerified(data.email)
                        if (confirmed) {
                            let token = await userController.generateToken(userData)
                            let answer = {
                                status: 201,
                                message: "correct login",
                                token: token
                            }
                            response.writeHead(201, { "Content-Type": "application/json" })
                            response.end(JSON.stringify(answer))
                        } else {
                            let answer = {
                                status: 409,
                                message: "Użytkownik niepotwierdzony"
                            }
                            response.writeHead(409, { "Content-Type": "application/json" })
                            response.end(JSON.stringify(answer))
                        }
                    } else {
                        let answer = {
                            status: 409,
                            message: "Złe hasło"
                        }
                        response.writeHead(409, { "Content-Type": "application/json" })
                        response.end(JSON.stringify(answer))
                    }
                } else {
                    let answer = {
                        status: 409,
                        message: "Zły email"
                    }
                    response.writeHead(409, { "Content-Type": "application/json" })
                    response.end(JSON.stringify(answer))
                }
                break
        }
    } else if (request.url == "/api/user/register") {
        switch (request.method) {
            case "POST":
                let data = await getRequestData(request)
                data = JSON.parse(data)
                let userExist = jsonController.doesUserExist(data.email)
                if (!userExist) {
                    data.password = await userController.encrypt(data.password)
                    let answer = await jsonController.addUser(data)
                    response.writeHead(201, { "Content-Type": "application/json" })
                    response.end(JSON.stringify(answer))
                } else {
                    let answer = {
                        status: 409,
                        message: "user already exists"
                    }
                    response.writeHead(409, { "Content-Type": "application/json" })
                    response.end(JSON.stringify(answer))
                }
                break
        }
    } else if (request.url.match(/\/api\/user\/register\/([0-9a-z.\-_]+)/)) {
        switch (request.method) {
            case "POST":
                let data = await getRequestData(request)
                data = JSON.parse(data)
                let answer = await userController.verifyToken(data.token)
                console.log("Answer: ", answer)
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
                    jsonController.userVerified(answer.email)
                    let serverAnswer = {
                        status: 201,
                        message: "user confirmed"
                    }
                    response.writeHead(201, { "Content-Type": "application/json" })
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