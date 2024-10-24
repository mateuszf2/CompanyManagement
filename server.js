const fs = require('fs')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

let config = {
    port: 8000,
    frontend: './pai2024-vue/dist',
    dbUrl: 'mongodb://localhost:27017/'
}

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())
app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message })
})

app.use(express.static(config.frontend))

const dataEndpoint = '/data'
const historyEndpoint = '/history'

const history = {}

let data = {
    year: 2024,
    description: 'Aktualny rok'
} 

app.get(dataEndpoint, (req, res) => {
    res.json(data)
})

app.get(historyEndpoint, (req, res) => {
    res.json(history)
})

const validYear = value => {
    const rok = parseInt(value)
    return (rok >= 1900 && rok <= 2024) ? '' : 'Wymagana wartość od 1900 do 2024'
}

const startsWithLetter = value => {
    const pattern = /^\p{L}/u
    return value && pattern.test(value) ? '' : 'Wymagane zaczynanie się od litery'
}

app.post(dataEndpoint, (req, res) => {
    if(req.body) {
        const validation = validYear(req.body.year) || startsWithLetter(req.body.description)
        if(validation == '') {
            data = req.body
            data.year = '' + data.year
            if(history[data.year]) {
                res.status(400).json({ validation: 'Próba nadpisania danych', set: false })        
            } else {
                res.json({ data, set: true })
                history[data.year] = data.description
            }
        } else {
            res.status(400).json({ validation, set: false })    
        }
    } else {
        res.status(400).json({ validation: 'Brak danych', set: false })
    }
})

try {
    config = JSON.parse(fs.readFileSync('config.json'))
    console.log('Konfiguracja z config.json')
} catch(err) {
    console.log('Konfiguracja domyślna')
}

app.listen(config.port, () => {
    console.log('Backend słucha na porcie', config.port)
})