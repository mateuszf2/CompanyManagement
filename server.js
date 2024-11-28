const fs = require('fs')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('uuid')
const mongoose = require('mongoose')

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

app.get(personEndpoint, (req, res) => {
    // pobierz wszystkie rekordy z bazy do zmiennej person
    let sort = {}
    if(req.query.sort) {
        sort[req.query.sort] = +req.query.order || 1
    }
    let aggregation = [{
        $match: {
            $or: [
                { firstName: { $regex: req.query.search || '' }},
                { lastName: { $regex: req.query.search || '' }}
            ]
        }
    }]

    aggregation.push({ $match: { firstName: { $regex: req.query.firstName || '' }}})
    aggregation.push({ $match: { lastName: { $regex: req.query.lastName || '' }}})
    if(req.query.sort) {
        aggregation.push({ $sort: sort })
    }
    aggregation.push({ $skip: +req.query.skip || 0 })
    aggregation.push({ $limit: +req.query.limit || 1000000 })
    Person.aggregate(aggregation)
    .then(person => {
        res.json(person)
    })
    .catch(err => {
        res.status(400).json({ error: 'Nieudany odczyt z bazy' })
    })    
})

app.post(personEndpoint, (req, res) => {
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

app.put(personEndpoint, (req, res) => {
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

app.delete(personEndpoint, (req, res) => {
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
})
.catch(err => {
    console.error('Połączenie z bazą danych nieudane', err)
    process.exit(0)
})

app.listen(config.port, () => {
    console.log('Backend słucha na porcie', config.port)
})