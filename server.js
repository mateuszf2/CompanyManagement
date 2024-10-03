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

app.use(express.static(config.frontend))

app.use('/test', (req, res) => {
    res.json({ test: true })
})

app.listen(config.port, () => {
    console.log('Backend listening on port', config.port)
})