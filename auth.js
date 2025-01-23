const crypto = require('crypto')
const mongoose = require('mongoose')
const uuid = require('uuid')

const schema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    username: { type: String, required: true },
    password: { type: String, required: true },
    roles: { type: [ Number ] }
}, { versionKey: false })

const makeHash = password => {
    return crypto.createHash('sha256').update(password).digest('base64')
}

const getIntersection = (array1, array2) => {
    const lookupSet = new Set(array2)
    return array1.filter(element => lookupSet.has(element))
}

const auth = module.exports = {

    makeHash,
    User: null,

    init: conn => {

        auth.User = conn.model('user', schema)

        // stwórz admina jeśli nie istnieje
        auth.User.findOne({ username: 'admin' })
            .then(user => {
                if (!user) {
                    const admin = new User({ username: 'admin', password: makeHash('admin'), roles: [0] })
                    admin.save()
                    console.log('Tworzę użytkownika admin')
                }
            })
            .catch(err => {
                console.error(err.message)
            })

        // stwórz usera jeżeli nie istnieje
        auth.User.findOne({ username: 'user' })
            .then(user => {
                if (!user) {
                    const admin = new User({ username: 'user', password: makeHash('user'), roles: [1] })
                    admin.save()
                    console.log('Tworzę użytkownika user')
                }
            })
            .catch(err => {
                console.error(err.message)
            })
    },

    checkCredentials: (username, password, nextTick) => {
        auth.User.findOne({ username, password: makeHash(password) })
        .then(user => nextTick(null, user || false))
        .catch(err => nextTick(null, false))
    },

    checkIfInRole: roleNums => (req, res, nextTick) => {
        let intersection = getIntersection(roleNums || [], req.user ? (req.user.roles || []) : [])
        if(!req.isAuthenticated()) {
            res.status(401).json({ error: 'Unauthorized' })
        } else if(intersection.length > 0) {
            return nextTick()
        } else {
            res.status(403).json({ error: 'Permission denied' })
        }
    },

    serialize: (user, nextTick) => nextTick(null, user.username),

    deserialize: (username, nextTick) => {
        auth.User.findOne({ username })
        .then(user => {
            if(user) {
                return nextTick(null, user)
            } else {
                return nextTick(new Error('Nie ma takiego użytkownika'), null)
            }
        })
        .catch(err => ({ error: err.message }))
    },

    login: (req, res) => auth.whoami(req, res),

    logout: (req, res) => req.logout(() => auth.whoami(req, res) ),

    whoami: (req, res) => {
        req.session.roles = req.user ? req.user.roles : []
        req.session.save()
        let data = { sessionid: req.session.id }
        if(req.user) {
            data.username = req.user.username
            data.roles = req.user.roles    
        }
        res.json(data)
    },

    errorHandler: (err, req, res, nextTick) => res.status(401).json({ error: `Błąd [${err.message}]'` }),
}