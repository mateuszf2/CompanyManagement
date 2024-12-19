const fs = require('fs')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('uuid')
const mongoose = require('mongoose')
const expressSession = require('express-session')
const passport = require('passport')
const passportJson = require('passport-json')

// własne moduły
const auth = require('./auth')

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
app.use(expressSession({ secret: config.dbUrl, resave: false , saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportJson.Strategy(auth.checkCredentials))
passport.serializeUser(auth.serialize)
passport.deserializeUser(auth.deserialize)

// endpointy autentykacji
const authEndpoint = '/api/auth'
app.get(authEndpoint, auth.whoami)
app.post(authEndpoint, passport.authenticate('json', { failWithError: true }), auth.login, auth.errorHandler)
app.delete(authEndpoint, auth.logout)

const personSchema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    firstName: { type: String, required: true, validate: {
        validator: value => /^\p{L}/u.test(value),
        message: props => `${props.value} nie pasuje do wymagań`
    }},
    lastName: { type: String, required: true, validate: {
        validator: value => /^\p{L}/u.test(value),
        message: props => `${props.value} nie pasuje do wymagań`
    }},
    birthDate: { type: Date, required: true, validate: {
        validator: value => value <= new Date(),
        message: props => `${props.value} nie jest prawidłową datą urodzenia`
        }, transform: value => value.toISOString().substr(0, 10)
    }
}, {
    versionKey: false,
    additionalProperties: false
})

const personEndpoint = '/api/person'
let Person = null

app.get(personEndpoint, auth.checkIfInRole([0, 1]), (req, res) => {
    // pobierz wszystkie rekordy z bazy do zmiennej person
    let sort = {}
    if(req.query.sort) {
        sort[req.query.sort] = req.query.order == 'desc' ? -1 : 1
    }
    const matching = {
        $match: {
            $or: [
                { firstName: { $regex: req.query.search || '' }},
                { lastName: { $regex: req.query.search || '' }}
            ]
        }
    }

    const aggregation = [ matching ]

    if(req.query.sort) {
        aggregation.push({ $sort: sort })
    }
    const skip = +req.query.skip || 0
    if(skip > 0) {
        aggregation.push({ $skip: skip })
    }
    const limit = +req.query.limit || 0
    if(limit > 0) {
        aggregation.push({ $limit: limit })
    }
    Person.aggregate([{ $facet: {
        total: [ matching, { $count: 'count' } ],
        data: aggregation
    }}])
    .then(facet => {
        [ facet ] = facet
        facet.total = ( facet.total && facet.total[0] ? facet.total[0].count : 0) || 0
        facet.data = facet.data.map(person => new Person(person))
        res.json(facet)
    })
    .catch(err => {
        res.status(400).json({ error: 'Nieudany odczyt z bazy' })
    })    
})

app.post(personEndpoint, auth.checkIfInRole([0]), (req, res) => {
    if(req.body) {
        // utwórz obiekt na podstawie req.body, zwaliduj go i zapisz do bazy
        const person = new Person(req.body)
        const err = person.validateSync()
        if(err) {
            res.status(400).json({ error: err.message })
            return
        }
        person.save()
        .then(personAdded => {
            res.json(personAdded)
        })
        .catch(err => res.status(400).json({ error: err.message, set: false }))
    } else {
        res.status(400).json({ error: 'Brak danych', set: false })
    }
})

app.put(personEndpoint, auth.checkIfInRole([0]), (req, res) => {
    if(req.body && req.body._id) {
        const _id = req.body._id
        delete req.body._id
        Person.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
        .then(personUpdated => {
            res.json(personUpdated)
        })
        .catch(err => res.status(400).json({ error: err.message }))
    } else {
        res.status(400).json({ error: 'Brak danych do aktualizacji' })
    }
})

app.delete(personEndpoint, auth.checkIfInRole([0]), (req, res) => {
    if(req.query._id) {
        const _id = req.query._id
        Person.findOneAndDelete({ _id })
        .then(personDeleted => {
            res.json(personDeleted)
        })
        .catch(err => res.status(400).json({ error: err.message }))
    } else {
        res.status(400).json({ error: 'Brak danych do usunięcia' })
    }
})

const projectSchema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    name: { type: String, required: true, validate: {
        validator: value => /^\p{L}/u.test(value),
        message: props => `${props.value} nie pasuje do wymagań`
    }},
    startDate: { type: Date, required: true, validate: {
        validator: value => !!(new Date()),
        message: props => `${props.value} nie jest prawidłową datą urodzenia`
        }, transform: value => value.toISOString().substr(0, 10)
    },
    endDate: { type: Date, required: false, validate: {
        validator: value => !!(new Date()),
        message: props => `${props.value} nie jest prawidłową datą urodzenia`
        }, transform: value => value.toISOString().substr(0, 10)
    }
}, {
    versionKey: false,
    additionalProperties: false
})

const projectEndpoint = '/api/project'
let Project = null

app.get(projectEndpoint, auth.checkIfInRole([0, 1]), (req, res) => {
    // pobierz wszystkie rekordy z bazy do zmiennej project
    let sort = {}
    if(req.query.sort) {
        sort[req.query.sort] = req.query.order == 'desc' ? -1 : 1
    }
    const matching = {
        $match: { name: { $regex: req.query.search || '' }}
    }

    const aggregation = [ matching ]

    if(req.query.sort) {
        aggregation.push({ $sort: sort })
    }
    const skip = +req.query.skip || 0
    if(skip > 0) {
        aggregation.push({ $skip: skip })
    }
    const limit = +req.query.limit || 0
    if(limit > 0) {
        aggregation.push({ $limit: limit })
    }
    Project.aggregate([{ $facet: {
        total: [ matching, { $count: 'count' } ],
        data: aggregation
    }}])
    .then(facet => {
        [ facet ] = facet
        facet.total = ( facet.total && facet.total[0] ? facet.total[0].count : 0) || 0
        facet.data = facet.data.map(project => new Project(project))
        res.json(facet)
    })
    .catch(err => {
        res.status(400).json({ error: 'Nieudany odczyt z bazy' })
    })    
})

app.post(projectEndpoint, auth.checkIfInRole([0]), (req, res) => {
    if(req.body) {
        // utwórz obiekt na podstawie req.body, zwaliduj go i zapisz do bazy
        const project = new Project(req.body)
        const err = project.validateSync()
        if(err) {
            res.status(400).json({ error: err.message })
            return
        }
        project.save()
        .then(projectAdded => {
            res.json(projectAdded)
        })
        .catch(err => res.status(400).json({ error: err.message, set: false }))
    } else {
        res.status(400).json({ error: 'Brak danych', set: false })
    }
})

app.put(projectEndpoint, auth.checkIfInRole([0]), (req, res) => {
    if(req.body && req.body._id) {
        const _id = req.body._id
        delete req.body._id
        Project.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
        .then(projectUpdated => {
            res.json(projectUpdated)
        })
        .catch(err => res.status(400).json({ error: err.message }))
    } else {
        res.status(400).json({ error: 'Brak danych do aktualizacji' })
    }
})

app.delete(projectEndpoint, auth.checkIfInRole([0]), (req, res) => {
    if(req.query._id) {
        const _id = req.query._id
        Project.findOneAndDelete({ _id })
        .then(projectDeleted => {
            res.json(projectDeleted)
        })
        .catch(err => res.status(400).json({ error: err.message }))
    } else {
        res.status(400).json({ error: 'Brak danych do usunięcia' })
    }
})

try {
    config = JSON.parse(fs.readFileSync('config.json'))
    console.log('Konfiguracja z config.json')
} catch(err) {
    console.log('Konfiguracja domyślna')
}

mongoose.connect(config.dbUrl)
.then(conn => {
    console.log('Połączenie z bazą danych nawiązane')
    Person = conn.model('person', personSchema)
    Project = conn.model('project', projectSchema)
})
.catch(err => {
    console.error('Połączenie z bazą danych nieudane', err)
    process.exit(0)
})

app.listen(config.port, () => {
    console.log('Backend słucha na porcie', config.port)
})