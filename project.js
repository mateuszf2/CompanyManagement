const uuid = require('uuid')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
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
    },
    contractor_ids: { type: [ String ], required: false, default: [] }
}, {
    versionKey: false,
    additionalProperties: false
})

const project = module.exports = {
    endpoint: '/api/project',
    model: null,
    
    init: conn => {
        project.model = conn.model('project', schema)
    },

    get: (req, res) => {
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
        aggregation.push({
            $lookup: {
                from: 'people',
                localField: 'contractor_ids',
                foreignField: '_id',
                as: 'contractors'
            }
        })
        project.model.aggregate([{ $facet: {
            total: [ matching, { $count: 'count' } ],
            data: aggregation
        }}])
        .then(facet => {
            [ facet ] = facet
            facet.total = ( facet.total && facet.total[0] ? facet.total[0].count : 0) || 0
            facet.data = facet.data.map(item => {
                const newItem = new project.model(item).toObject()
                newItem.contractors = item.contractors.map(item => item.firstName.charAt(0) + item.lastName.charAt(0))
                return newItem
            })
            res.json(facet)
        })
        .catch(err => {
            res.status(400).json({ error: 'Nieudany odczyt z bazy' })
        })    
    },

    post: (req, res) => {
        if(req.body) {
            // utwórz obiekt na podstawie req.body, zwaliduj go i zapisz do bazy
            const item = new project.model(req.body)
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
            project.model.findOneAndUpdate({ _id }, { $set: req.body }, { new: true, runValidators: true })
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
            project.model.findOneAndDelete({ _id })
            .then(itemDeleted => {
                res.json(itemDeleted)
            })
            .catch(err => res.status(400).json({ error: err.message }))
        } else {
            res.status(400).json({ error: 'Brak danych do usunięcia' })
        }
    }
}