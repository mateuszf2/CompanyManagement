const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const config = {
    port: 8000,
    frontend: './pai2024-vue/dist'
}

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())
app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message })
})


app.use(express.static(config.frontend))

const daneEndpoint = '/dane'
let dane = ''

app.get(daneEndpoint, (req, res) => {
    res.json({ dane })
})

const startsWithLetter = value => {
    const pattern = /^\p{L}/u
    return pattern.test(value) || 'Wymagane zaczynanie się od litery'
}

app.post(daneEndpoint, (req, res) => {
    if(req.body && req.body.dane) {
        let validation = startsWithLetter(req.body.dane)
        if(validation === true) {
            dane = req.body.dane
            res.json({ dane, set: true })
        } else {
            res.status(400).json({ validation, set: false })    
        }
    } else {
        res.status(400).json({ validation: 'Dane niepełne', set: false })
    }
})

app.listen(config.port, () => {
    console.log('Backend słucha na porcie', config.port)
})