class Photo {
    constructor(id, album, url, timestamp, description, authorUsername, authorFullname, authorAvatar, tagsArray) {
        this.id = id
        this.album = album
        this.url = url
        this.lastChange = "original"
        this.history = [
            {
                status: "original",
                timestamp: timestamp
            }
        ]
        this.tags = tagsArray
        this.description = description
        this.authorUsername = authorUsername
        this.authorFullname = authorFullname
        this.authorAvatar = authorAvatar
    }

    newVersion = () => {

    }
}

let photosArray = [
]

let tagsArray = [
    "love",
    "instagood",
    "fashion",
    "photooftheday",
    "art",
    "photography",
    "instagram",
    "beautiful",
    "picoftheday",
    "nature",
    "happy",
    "cute",
    "travel",
    "style",
    "followme",
    'tbt',
    "instadaily",
    "repost",
    "like4like",
    "summer",
    "beauty",
    "fitness",
    "food",
    "selfie",
    "me",
    "instalike",
    "girl",
    "friends",
    "fun"
]

let extTagsArray = []

let userArray = [
    {
        id: 1,
        email: 'sus@sus',
        username: 'sus',
        fullname: 'Suspection',
        password: 'sus',
        confirmed: true,
        profileURL: 'https://assets.puzzlefactory.pl/puzzle/369/033/original.jpg'
    },
    {
        id: 2,
        email: 'user1@gmail.com',
        username: 'user1',
        fullname: 'UserOne',
        password: 'user1',
        confirmed: true,
        profileURL: null
    },
    {
        id: 3,
        email: 'user2@gmail.com',
        username: 'user2',
        fullname: 'UserTwo',
        password: 'user2',
        confirmed: true,
        profileURL: 'https://ps.w.org/cbxuseronline/assets/icon-256x256.png?rev=2284897'
    }
]

module.exports = { Photo, photosArray, tagsArray, extTagsArray, userArray };