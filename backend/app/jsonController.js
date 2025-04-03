const userController = require('./userController')
const model = require('./model')
const fs = require('fs')
const fsExtra = require('fs-extra')
const path = require('path')

module.exports = {
    getAll: async () => {
        return model.photosArray
    },
    getAllThatMatch: (username, album) => {
        //pusty username to: $
        //pusty album to: $
        let photosFiltered = null
        if (username != '$') {
            photosFiltered = model.photosArray.filter((photo) => { return photo.authorUsername == username })
            if (album != '$') {
                photosFiltered = photosFiltered.filter((photo) => { return photo.album == album })
            }
        } else {
            if (album != '$') {
                photosFiltered = model.photosArray.filter((photo) => { return photo.album == album })
            } else {
                photosFiltered = model.photosArray
            }
        }
        return photosFiltered
    },
    getOne: async (id) => {
        return new Promise((resolve, reject) => {
            try {
                let thatOne = model.photosArray.filter((object) => { return object.id == id })[0]
                if (thatOne !== undefined) {
                    fs.readFile(thatOne.url, function (error, data) {
                        if (error) {
                            throw error
                        }
                        else {
                            thatOne = data
                            resolve(thatOne)
                        }
                    })
                }
            }
            catch (err) {
                reject(err)
            }
        })
    },
    getUserAlbums: (username) => {
        let userPhotos = model.photosArray.filter(photo => { return photo.authorUsername == username })
        let albumsArray = []
        userPhotos.forEach(photo => {
            if (!albumsArray.includes(photo.album) && photo.album != 'default') {
                albumsArray.push(photo.album)
            }
        })
        return albumsArray
    },
    add: (data) => {
        let newPhoto = new model.Photo(data.id, data.album, data.url, data.timestamp, data.description, data.authorUsername, data.authorFullname, data.authorAvatar, data.tags)
        model.photosArray.push(newPhoto)
        let serverAnswer = {
            message: data.message,
            photoData: newPhoto
        }
        return serverAnswer
    },
    delete: (answer) => {
        let data = JSON.parse(answer)
        for (let i = 0; i < model.photosArray.length; i++) {
            if (model.photosArray[i].id == data.deletedPhotoData.id) {
                model.photosArray.splice(i, 1)
                i = model.photosArray.length
                data.jsonMessage = "photo data successfully deleted"
            }
        }
        return data
    },
    addTag: (data) => {
        data = JSON.parse(data)
        if (model.extTagsArray.length > 0 && model.tagsArray.includes(data.tag)) {
            for (let i = 0; i < model.extTagsArray.length; i++) {
                if (model.extTagsArray[i].name == data.tag) {
                    data.popularity = model.extTagsArray[i].popularity
                }
            }
        } else {
            model.tagsArray.push(data.tag)
        }
        let index = 0
        for (let i = 0; i < model.photosArray.length; i++) {
            if (model.photosArray[i].id == data.id) {
                if (data?.popularity) {
                    model.photosArray[i].tags.push({
                        name: data.tag,
                        popularity: data.popularity
                    })
                } else {
                    model.photosArray[i].tags.push({
                        name: data.tag,
                        popularity: 0
                    })
                }
                index = i
                i = model.photosArray.length
            }
        }

        let answer = {
            message: "tag " + data.tag + "successfully added to photo if id " + data.id,
            photoData: model.photosArray[index]
        }
        return answer
    },
    addTags: (data) => {
        data = JSON.parse(data)
        if (model.extTagsArray.length > 0) {
            for (let i = 0; i < data.tags.length; i++) {
                if (model.tagsArray.includes(data.tags[i].tag)) {
                    for (let j = 0; j < model.extTagsArray.length; j++) {
                        if (model.extTagsArray[j].name == data.tags[i].tag) {
                            data.tags[i].popularity = model.extTagsArray[j].popularity
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < data.tags.length; i++) {
                model.tagsArray.push(data.tags[i].tag)
            }
        }
        let index = 0
        for (let i = 0; i < model.photosArray.length; i++) {
            if (model.photosArray[i].id == data.id) {
                for (let j = 0; j < data.tags.length; j++) {
                    if (data.tags[j]?.popularity) {
                        model.photosArray[i].tags.push({
                            name: data.tags[j].tag,
                            popularity: data.tags.popularity
                        })
                    } else {
                        model.photosArray[i].tags.push({
                            name: data.tags[j].tag,
                            popularity: 0
                        })
                    }
                }
                index = i
                i = model.photosArray.length
            }
        }

        let stringOfTags = ""
        for (let i = 0; i < data.tags.length; i++) {
            stringOfTags += data.tags[i].tag
            if (i != data.tags.length - 1) {
                stringOfTags += ", "
            }
        }
        let answer = {
            message: "requested tags (" + stringOfTags + ") successfully added to photo if id " + data.id,
            photoData: model.photosArray[index]
        }
        return answer
    },
    getTags: (id) => {
        let thatOne = model.photosArray.filter((object) => { return object.id == id })[0]
        if (thatOne === undefined) {
            thatOne = {
                status: 404,
                message: "photo of id '" + id + "' does not exist"
            }
        } else {
            let tagsTemp = thatOne.tags
            if (tagsTemp.length != 0) {
                thatOne = {
                    tags: tagsTemp
                }
            } else {
                thatOne = {
                    message: "photo of id '" + id + "' does not have any tags"
                }
            }
        }
        return thatOne
    },
    addUser: async (data) => {
        let id = model.userArray.length + 1
        while (model.userArray.filter((user) => { return user.id == id }).length > 0) {
            id++
        }
        let newUser = {
            id: id,
            email: data.email,
            username: data.username,
            fullname: data.fullname,
            password: data.password,
            confirmed: false
        }
        model.userArray.push(newUser)
        let userToken = await userController.generateToken(data)
        let newDir = await userController.makeNewDir(newUser.username)
        if (newDir == 'success') {
            let link = process.env.APP_ADDRESS + "/api/user/register/" + userToken
            let answer = {
                message: link
            }
            return answer
        }
    },
    doesUserExist: (email) => {
        let matchingUser = model.userArray.filter((user) => { return user.email == email })[0]
        if (matchingUser === undefined) {
            return false
        } else {
            return true
        }
    },
    userVerified: (email) => {
        for (let i = 0; i < model.userArray.length; i++) {
            if (model.userArray[i].email == email) {
                model.userArray[i].confirmed = true
                break
            }
        }
    },
    getUserData: (email) => {
        let matchingUser = model.userArray.filter((user) => { return user.email == email })[0]
        return matchingUser
    },
    getUsernameData: (username) => {
        let matchingUser = model.userArray.filter((user) => { return user.username == username })[0]
        return matchingUser
    },
    updatePhotosData: (oldUsername, newData) => {
        model.photosArray.forEach(photo => {
            if (photo.authorUsername == oldUsername) {
                if (newData.newUsername != '') {
                    photo.authorUsername = newData.newUsername
                    let actualURLArray = photo.url.split('\\')
                    let fileName = actualURLArray[actualURLArray.length - 1]
                    photo.url = path.join(__dirname, '..', 'upload', newData.newUsername, photo.album, fileName)
                }
                if (newData.newFullname != '') {
                    photo.authorFullname = newData.newFullname
                }
            }
        })
    },
    changeAvatarDirectory: async (oldUsername, newUsername) => {
        return new Promise((resolve, reject) => {
            try {
                let matchingUser = model.userArray.filter((user) => { return user.username == newUsername })[0]
                if (matchingUser.profileURL !== undefined && matchingUser.profileURL !== null) {
                    if (matchingUser.profileURL.includes('profiles')) {
                        fs.readdir(path.join(__dirname, '..', 'profiles'), { withFileTypes: true }, (err, files) => {
                            if (err) {
                                throw err
                            } else {
                                files.forEach(async file => {
                                    if (file.name.split('.')[0] == oldUsername) {
                                        let oldFileName = oldUsername + '.' + file.name.split('.')[1]
                                        let newFileName = newUsername + '.' + file.name.split('.')[1]
                                        model.userArray.forEach(user => {
                                            if (user.username == newUsername) {
                                                user.profileURL = path.join(__dirname, '..', 'profiles', newFileName)
                                            }
                                        })
                                        fs.rename(path.join(__dirname, '..', 'profiles', oldFileName), path.join(__dirname, '..', 'profiles', newFileName), (err) => {
                                            if (err) {
                                                throw err
                                            } else {
                                                resolve('success')
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        resolve('nothing happend')
                    }
                } else {
                    resolve('nothing happend')
                }
            }
            catch (err) {
                reject(err)
            }
        })
    },
    updateUserAvatarDir: (newUsername) => {
        model.userArray.forEach(user => {
            if (user.username == newUsername) {
                if (user.profileURL !== undefined && user.profileURL !== null) {
                    if (!user.profileURL.includes('profiles')) {
                        return 'success'
                    } else {
                        let actualURLArray = user.profileURL.split('\\')
                        let filename = actualURLArray[actualURLArray.length - 1]
                        let filenameArray = filename.split('.')
                        let newFilename = newUsername + '.' + filenameArray[filenameArray.length - 1]
                        let url = path.join(__dirname, '..', 'profiles', newFilename)
                        user.profileURL = url
                        model.photosArray.forEach(photo => {
                            if (photo.authorUsername == newUsername) {
                                photo.authorAvatar = url
                            }
                        })
                        return 'success'
                    }
                } else {
                    return 'success'
                }
            }
        })
        return 'success'
    },
    updateUserAvatar: (url, email) => {
        let username
        console.log('url: ', url)
        model.userArray.forEach(user => {
            if (user.email == email) {
                user.profileURL = url
                username = user.username
            }
        })
        model.photosArray.forEach(photo => {
            if (photo.authorUsername == username) {
                photo.authorAvatar = url
            }
        })
        return "image uploaded"
    },
    changeUserFolderName: async (oldUsername, newUsername) => {
        return new Promise((resolve, reject) => {
            try {
                fsExtra.copySync(path.join(__dirname, '..', 'upload', oldUsername), path.join(__dirname, '..', 'upload', newUsername))
                fs.rm(path.join(__dirname, '..', 'upload', oldUsername), {
                    recursive: true, force: true
                }, (err) => {
                    if (err) {
                        throw err
                    } else {
                        resolve('success')
                    }
                })
            }
            catch (err) {
                reject(err)
            }
        })
    },
    checkIfUserVerified: (email) => {
        let response
        for (let i = 0; i < model.userArray.length; i++) {
            if (model.userArray[i].email == email) {
                response = model.userArray[i].confirmed
                break
            }
        }
        return response
    },
    simpleUpdate: (data, oldEmail) => {
        for (let i = 0; i < model.userArray.length; i++) {
            if (model.userArray[i].email == oldEmail) {
                if (data.username != '') {
                    model.userArray[i].username = data.username
                }
                if (data.fullname != '') {
                    model.userArray[i].fullname = data.fullname
                }
                if (data.email != '') {
                    model.userArray[i].email = data.email
                }
                let answer = {
                    newUsername: data.username,
                    newFullname: data.fullname,
                    newEmail: data.email
                }
                return answer
            }
        }
    },
    passwordUpdate: async (data) => {
        let matchingUser = model.userArray.filter((user) => { return user.email == data.email })[0]
        let decrypted = await userController.decrypt(data.oldPassword, matchingUser.password)
        if (decrypted) {
            for (let i = 0; i < model.userArray.length; i++) {
                if (model.userArray[i].email == data.email) {
                    model.userArray[i].username = data.username
                    model.userArray[i].fullname = data.fullname
                    model.userArray[i].email = data.email
                    model.userArray[i].password = await userController.encrypt(data.newPassword)
                    break
                }
            }
            let message = {
                status: 201,
                message: "successfully updated data"
            }
            return message
        } else {
            let message = {
                status: 400,
                message: "unvalid old password"
            }
            return message
        }
    },
    getAllUsers: () => {
        return model.userArray
    },
    setupExistingUsers: async () => {
        model.userArray.forEach(async element => {
            element.password = await userController.encrypt(element.password)
            if (element.profileURL === null) {
                fs.readdir(path.join(__dirname, '..', "profiles"), (err, files) => {
                    files.forEach(file => {
                        if (file.split(".")[0] == element.username) {
                            element.profileURL = path.join(__dirname, '..', "profiles", file)
                        }
                    })
                })
            }
        })
    },
    setupExistingPhotos: async () => {
        fs.readdir(path.join(__dirname, '..', "upload"), (err1, userDirs) => {
            if (err1) {
                throw err1
            } else {
                userDirs.forEach(async userDir => {
                    fs.readdir(path.join(__dirname, '..', 'upload', userDir), (err2, albumDirs) => {
                        if (err2) {
                            throw err2
                        } else {
                            albumDirs.forEach(async albumDir => {
                                fs.readdir(path.join(__dirname, '..', 'upload', userDir, albumDir), { withFileTypes: true }, (err3, files) => {
                                    if (err3) {
                                        throw err3
                                    } else {
                                        files.forEach(photo => {
                                            let id = model.photosArray.length
                                            id++
                                            let album = albumDir
                                            let url = path.join(__dirname, '..', 'upload', userDir, albumDir, photo.name)
                                            let timestamp = new Date().toISOString()
                                            let description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non augue arcu. Aenean nec facilisis dui. Curabitur euismod finibus sem tristique scelerisque.'
                                            let authorUsername = model.userArray.filter((user) => { return user.username == userDir })[0].username
                                            let authorFullname = model.userArray.filter((user) => { return user.username == userDir })[0].fullname
                                            let authorAvatar = model.userArray.filter((user) => { return user.username == userDir })[0].profileURL
                                            let tagsArray = [model.tagsArray[Math.floor(Math.random() * 10)], model.tagsArray[Math.floor(Math.random() * 10) + 11]]
                                            let newPhoto = new model.Photo(id, album, url, timestamp, description, authorUsername, authorFullname, authorAvatar, tagsArray)
                                            model.photosArray.push(newPhoto)
                                        })
                                    }
                                })
                            })
                        }
                    })
                })
            }
        })
    },
    getProfilePic: async (username) => {
        return new Promise((resolve, reject) => {
            try {
                let thatOne = model.userArray.filter((user) => { return user.username == username })[0]
                if (thatOne !== undefined) {
                    console.log(thatOne.profileURL);
                    if (thatOne.profileURL !== null) {
                        fs.readFile(thatOne.profileURL, function (error, data) {
                            if (error) {
                                throw error
                            }
                            else {
                                thatOne = data
                                resolve(thatOne)
                            }
                        })
                    } else {
                        resolve({
                            message: 'ProfilePic not found!'
                        })
                    }
                }
            }
            catch (err) {
                reject(err)
            }
        })
    }
}