const uuid = require('uuid')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
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

const person = module.exports = {
    endpoint: '/api/person',
    model: null,
    
    init: conn => {
        person.model = conn.model('person', schema)
    },

    get: (req, res) => {
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
        person.model.aggregate([{ $facet: {
            total: [ matching, { $count: 'count' } ],
            data: aggregation
        }}])
        .then(facet => {
            [ facet ] = facet
            facet.total = ( facet.total && facet.total[0] ? facet.total[0].count : 0) || 0
            facet.data = facet.data.map(item => new person.model(item))
            res.json(facet)
        })
        .catch(err => {
            res.status(400).json({ error: 'Nieudany odczyt z bazy' })
        })    
    },

    post: (req, res) => {
        if(req.body) {
            const item = new person.model(req.body)
            const err = item.validateSync()
            if(err) {
                res.status(400).json({ error: err.message })
                return
            }
            item.save()
            .then(itemAdded => {
                res.json(itemAdded)
            })
            .catch(err => res.status(400).json({ error: err.message }))
        } else {
            res.status(400).json({ error: 'Brak danych' })
        }
    },

    put: (req, res) => {
        if(req.body && req.body._id) {
            const _id = req.body._id
            delete req.body._id
            person.model.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
            .then(itemUpdated => {
                res.json(itemUpdated)
            })
            .catch(err => res.status(400).json({ error: err.message }))
        } else {
            res.status(400).json({ error: 'Brak danych do aktualizacji' })
        }
    },

    delete: (req, res) => {
        if(req.query._id) {
            const _id = req.query._id
            person.model.findOneAndDelete({ _id })
            .then(itemDeleted => {
                res.json(itemDeleted)
            })
            .catch(err => res.status(400).json({ error: err.message }))
        } else {
            res.status(400).json({ error: 'Brak danych do usunięcia' })
        }
    }
}