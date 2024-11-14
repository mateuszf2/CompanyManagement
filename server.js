const fs = require('fs')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('uuid')
const mongoose = require('mongoose')
const { EventEmitter } = require('stream')

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

const historySchema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    year: { type: Number, required: true, validate: {
        validator: (value) => Number.isInteger(value) &&
          value >= 1900 && value <= new Date().getFullYear(),
        message: props => `${props.value} nie jest prawidłowym rokiem`
    }},
    description: { type: String, required: true, validate: {
        validator: value => /^\p{L}/u.test(value),
        message: props => `${props.value} nie pasuje do wymagań`
    }}
}, {
    versionKey: false,
    additionalProperties: false
})

const historyEndpoint = '/api/history'
let History = null

app.get(historyEndpoint, (req, res) => {
    // pobierz wszystkie rekordy z bazy do zmiennej history
    History.find({})
    .then(history => {
        res.json(history)
    })
    .catch(err => {
        res.status(400).json({ error: 'Nieudany odczyt z bazy' })
    })    
})

app.post(historyEndpoint, (req, res) => {
    if(req.body) {
        // utwórz obiekt na podstawie req.body, zwaliduj go i zapisz do bazy
        const history = new History(req.body)
        const err = history.validateSync()
        if(err) {
            res.status(400).json({ error: err.message })
            return
        }
        history.save()
        .then(historyAdded => {
            res.json(historyAdded)
        })
        .catch(err => res.status(400).json({ error: err.message, set: false }))
    } else {
        res.status(400).json({ error: 'Brak danych', set: false })
    }
})

app.put(historyEndpoint, (req, res) => {
    if(req.body && req.body._id) {
        const _id = req.body._id
        delete req.body._id
        History.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
        .then(historyUpdated => {
            res.json(historyUpdated)
        })
        .catch(err => res.status(400).json({ error: err.message }))
    } else {
        res.status(400).json({ error: 'Brak danych do aktualizacji' })
    }
})

app.delete(historyEndpoint, (req, res) => {
    if(req.query._id) {
        const _id = req.query._id
        History.findOneAndDelete({ _id })
        .then(historyDeleted => {
            res.json(historyDeleted)
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
    History = conn.model('History', historySchema)
})
.catch(err => {
    console.error('Połączenie z bazą danych nieudane', err)
    process.exit(0)
})

app.listen(config.port, () => {
    console.log('Backend słucha na porcie', config.port)
})