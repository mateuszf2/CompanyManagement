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

let dane = ''

app.get('/test', (req, res) => {
    res.json({ dane })
})

app.post('/test', (req, res) => {
    if(req.body && req.body.dane) {
        dane = req.body.dane
        res.json({ dane, set: true })
    } else {
        res.status(400).json({ set: false })
    }
})

app.listen(config.port, () => {
    console.log('Backend słucha na porcie', config.port)
})