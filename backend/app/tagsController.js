const model = require('./model')

module.exports = {
    getAllTagsRaw: () => {
        return model.tagsArray
    },
    getAllTagsExt: () => {
        let answer = []
        if (model.extTagsArray.length == 0) {
            let tags = model.tagsArray
            for (let i = 0; i < tags.length; i++) {
                let tagObject = {
                    id: i,
                    name: tags[i],
                    popularity: Math.floor(Math.random() * 900) + 100
                }
                answer.push(tagObject)
            }
            model.extTagsArray = answer
        } else {
            answer = model.extTagsArray
        }
        return answer
    },
    getOne: (id) => {
        let thatOne = model.extTagsArray.filter((object) => { return object.id == id })[0]
        if (thatOne === undefined) {
            thatOne = {
                status: 404,
                message: "tag of id '" + id + "' does not exist"
            }
        }
        return thatOne
    },
    add: (data) => {
        data = JSON.parse(data)
        let doesExist = false
        if (model.tagsArray.includes(data.name)) {
            doesExist = true
        }
        let answer
        if (doesExist) {
            answer = {
                status: 418,
                message: "tag of name '" + data.name + "' already exists"
            }
        } else {
            if (model.extTagsArray.length == 0) {
                model.tagsArray.push(data.name)
                answer = data.name
            } else {
                data.id = model.extTagsArray.length
                model.extTagsArray.push(data)
                answer = data
            }
        }
        return answer
    }
}