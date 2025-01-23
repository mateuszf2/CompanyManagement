const fs = require('fs')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const expressSession = require('express-session')
const passport = require('passport')
const passportJson = require('passport-json')
const expressWs = require('express-ws')

// własne moduły
const auth = require('./auth')
const websocket = require('./websocket')
const control = require('./control')
const person = require('./person')
const project = require('./project')

let config = {
    port: 8000,
    frontend: './pai2024-vue/dist',
    dbUrl: 'mongodb://localhost:27017/pai2024'
}

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())
app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message })
})

app.use(express.static(config.frontend))

// inicjalizacja mechanizmów utrzymania sesji i autoryzacji
const session = expressSession({ secret: config.dbUrl, resave: false , saveUninitialized: true })
app.use(session)
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportJson.Strategy(auth.checkCredentials))
passport.serializeUser(auth.serialize)
passport.deserializeUser(auth.deserialize)

// endpoint websocketu
const wsEndpoint = '/ws'
expressWs(app)
app.ws(wsEndpoint, (_ws, req, next) => session(req, {}, next), websocket.handle)

// endpointy autentykacji
const authEndpoint = '/api/auth'
app.get(authEndpoint, auth.whoami)
app.post(authEndpoint, passport.authenticate('json', { failWithError: true }), auth.login, auth.errorHandler)
app.delete(authEndpoint, auth.logout)

// endpointy stanu systemu
const whoEndpoint = '/api/control'
app.get(whoEndpoint + '/who', auth.checkIfInRole([0, 1]), control.whoGet)

app.get(person.endpoint, auth.checkIfInRole([0, 1]), person.get)
app.post(person.endpoint, auth.checkIfInRole([0]), person.post)
app.put(person.endpoint, auth.checkIfInRole([0]), person.put)
app.delete(person.endpoint, auth.checkIfInRole([0]), person.delete)

app.get(project.endpoint, auth.checkIfInRole([0, 1]), project.get)
app.post(project.endpoint, auth.checkIfInRole([0]), project.post)
app.put(project.endpoint, auth.checkIfInRole([0]), project.put)
app.delete(project.endpoint, auth.checkIfInRole([0]), project.delete)

try {
    config = JSON.parse(fs.readFileSync('config.json'))
    console.log('Konfiguracja z config.json')
} catch(err) {
    console.log('Konfiguracja domyślna')
}

console.log('Łączę się z bazą danych...')
mongoose.connect(config.dbUrl)
.then(conn => {
    console.log('Połączenie z bazą danych nawiązane')

    auth.init(conn)
    person.init(conn)
    project.init(conn)

    app.listen(config.port, () => {
        console.log('Backend słucha na porcie', config.port)
    })})
.catch(err => {
    console.error('Połączenie z bazą danych nieudane:', err.message)
    process.exit(0)
})