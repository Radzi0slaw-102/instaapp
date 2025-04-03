const model = require('./model')
const logger = require('tracer').colorConsole()
const fs = require('fs')
const path = require('path')

let promiseUploadPhoto = async (form, request, username) => {
    return new Promise((resolve, reject) => {
        try {
            form.keepExtensions = true
            form.uploadDir = "upload"
            let answer
            form.parse(request, function (err, fields, files) {
                console.log(fields);
                console.log(JSON.parse(fields.tags))
                let id = model.photosArray.length + 1
                while (model.photosArray.filter((photo) => { return photo.id == id }).length > 0) {
                    id++
                }
                let timestamp = new Date()
                let fileArray = files.file.path.split('\\')
                let filename = fileArray[fileArray.length - 1]
                let tagsObject = JSON.parse(fields.tags)
                answer = {
                    message: "file of id " + id + " send successfully",
                    id: id,
                    album: fields.album,
                    url: path.join(__dirname, '..', 'upload', username, fields.album, filename),
                    tags: tagsObject.tags,
                    timestamp: timestamp.toISOString(),
                    description: fields.description,
                    authorUsername: username
                }
                console.log(answer.url)
                let newDir = path.join(__dirname, '..', "upload", answer.authorUsername, answer.album)
                if (!fs.existsSync(newDir)) {
                    fs.mkdir(newDir, (err) => {
                        if (err) throw err
                        else {
                            let newFileDir = path.join(newDir, filename)
                            let oldDir = path.join(__dirname, '..', "upload", filename)
                            fs.rename(oldDir, newFileDir, (err) => {
                                if (err) throw err
                                else {
                                    resolve(answer)
                                }
                            })
                        }
                    })
                } else {
                    let newFileDir = path.join(newDir, filename)
                    let oldDir = path.join(__dirname, '..', "upload", filename)
                    fs.rename(oldDir, newFileDir, (err) => {
                        if (err) throw err
                        else {
                            resolve(answer)
                        }
                    })
                }
            })
        } catch (error) {
            reject(error.message)
        }
    })
}

let promiseUploadAvatar = async (form, request, username) => {
    return new Promise((resolve, reject) => {
        try {
            form.keepExtensions = true
            form.uploadDir = "profiles"
            form.parse(request, function (err, fields, files) {
                let fileArray = files.file.path.split('\\')
                let filename = fileArray[fileArray.length - 1]
                let fileExtArray = filename.split('.')
                let fileExt = fileExtArray[fileExtArray.length - 1]
                let oldDir = path.join(__dirname, '..', 'profiles', filename)
                let newFilename = username + '.' + fileExt
                let newDir = path.join(__dirname, '..', 'profiles', newFilename)
                fs.rename(oldDir, newDir, (err) => {
                    if (err) throw err
                    else {
                        resolve(newDir)
                    }
                })
            })
        } catch (error) {
            reject(error.message)

        }
    })
}

let promiseDeletePhoto = async (idOD) => {
    return new Promise((resolve, reject) => {
        try {
            let filteredJson = model.photosArray.filter((object) => { return object.id == idOD })[0]
            if (filteredJson === undefined) {
                filteredJson = {
                    status: 404,
                    message: "photo of id '" + idOD + "' already does not exist"
                }
                resolve(filteredJson)
            } else {
                let deletingPhoto = "upload_" + idOD + ".png"
                let deletePath = path.join(__dirname, '..', 'upload', filteredJson.album, deletingPhoto)
                console.log(deletePath)
                fs.rm((deletePath), {
                    recursive: true, force: true
                }, (err) => {
                    if (err) throw err
                    let answer = {
                        message: "photo of id '" + idOD + "' successfully deleted",
                        jsonMessage: "not done yet",
                        deletedPhotoData: filteredJson
                    }
                    resolve(answer)
                })
            }
        } catch (error) {
            reject(error.message)
        }
    })
}

const uploadPhoto = async (form, request, username) => {
    let answer = await promiseUploadPhoto(form, request, username)
    return JSON.stringify(answer)
}

const uploadAvatar = async (form, request, username) => {
    let answer = await promiseUploadAvatar(form, request, username)
    return answer
}

const deletePhoto = async (idOD) => {
    let answer = await promiseDeletePhoto(idOD)
    return JSON.stringify(answer)
}

module.exports = { uploadPhoto, deletePhoto, uploadAvatar }