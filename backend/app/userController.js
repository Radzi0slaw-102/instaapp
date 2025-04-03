const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
require("dotenv").config()

const encrypt = async (password) => {
    let answer = await bcrypt.hash(password, ~~process.env.BCRYPT_SALT)
    return answer
}

const decrypt = async (oldPassword, actualPassword) => {
    let decrypted = await bcrypt.compare(oldPassword, actualPassword)
    return decrypted
}

const generateToken = async (data) => {
    let secretKey = process.env.SECRET_KEY
    let token = await jwt.sign(
        data,
        secretKey,
        {
            expiresIn: "20m"
        }
    )
    return token
}

const verifyToken = async (token) => {
    let secretKey = process.env.SECRET_KEY
    try {
        let decoded = await jwt.verify(token, secretKey)
        return decoded
    }
    catch (ex) {
        return ex.message
    }
}

const makeNewDir = async (username) => {
    return new Promise((resolve, reject) => {
        try {
            fs.mkdir(path.join(__dirname, '..', 'upload', username), (err1) => {
                if (err1) {
                    throw err1
                } else {
                    fs.mkdir(path.join(__dirname, '..', 'upload', username, 'default'), (err2) => {
                        if (err2) {
                            throw err2
                        } else {
                            resolve('success')
                        }
                    })
                }
            })
        }
        catch (err) {
            reject(err)
        }
    })
}

module.exports = { encrypt, decrypt, generateToken, verifyToken, makeNewDir }