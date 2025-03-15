// task.js
const uuid = require('uuid')
const mongoose = require('mongoose')

const websocket = require('./websocket')


const schema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    project_id: { type: String, required: true },
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
    contractor_ids: { type: [String], required: false, default: [] }
}, {
    versionKey: false
})

const task = module.exports = {
    endpoint: '/api/task',
    model: null,
    
    init: conn => {
        task.model = conn.model('task', schema)
    },

    get: (req, res) => {
        // if (!req.query.project_id) {
        //     return res.status(400).json({ error: "Brak project_id" });
        // }
    
        let sort = {};
        if (req.query.sort) {
            sort[req.query.sort] = req.query.order === 'desc' ? -1 : 1;
        }
    
        const matching = {
            $match: { project_id: req.query.project_id }
        };

        // Dodaj warunek wyszukiwania po nazwie za pomocą $regex
        if (req.query.search) {
            matching.$match.name = { 
                $regex: req.query.search, 
                $options: 'i' // 'i' oznacza ignorowanie wielkości liter
            };
        }
    
        const aggregation = [matching];
    
        if (req.query.sort) {
            aggregation.push({ $sort: sort });
        }
    
        const skip = +req.query.skip || 0;
        if (skip > 0) {
            aggregation.push({ $skip: skip });
        }
    
        const limit = +req.query.limit || 0;
        if (limit > 0) {
            aggregation.push({ $limit: limit });
        }
    
        aggregation.push({
            $lookup: {
                from: 'people', // Nazwa kolekcji z osobami
                localField: 'contractor_ids',
                foreignField: '_id',
                as: 'contractors'
            }
        });
    
        task.model.aggregate([{ $facet: {
            total: [matching, { $count: 'count' }],
            data: aggregation
        }}])
        .then(facet => {
            [facet] = facet;
            facet.total = (facet.total && facet.total[0] ? facet.total[0].count : 0) || 0;
            facet.data = facet.data.map(item => {
                const newItem = new task.model(item).toObject();
                newItem.contractors = item.contractors.map(person => person.firstName.charAt(0) + person.lastName.charAt(0));
                return newItem;
            });
            res.json(facet);
        })
        .catch(err => {
            res.status(400).json({ error: 'Nieudany odczyt z bazy' });
        });
    },

    // w metodzie post
    post: (req, res) => {
        if(req.body) {
            const item = new task.model(req.body)
            item.save()
            .then(taskAdded => {
                // Wysyłanie danych przez WebSocket po zapisaniu
                const message = {
                    action: 'create', // Możesz to dostosować w zależności od operacji
                    type: 'task_update',
                    data: taskAdded
                }
                websocket.handleMessageToClients(message)

                res.json(taskAdded)
            })
            .catch(err => res.status(400).json({ error: err.message }))
        } else {
            res.status(400).json({ error: 'Brak danych' })
        }
    },

    // w metodzie put
    put: (req, res) => {
        if(req.body && req.body._id) {
            task.model.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }, { new: true })
            .then(taskUpdated => {
                // Wysyłanie danych przez WebSocket po aktualizacji
                const message = {
                    action: 'update',
                    type: 'task_update',
                    data: taskUpdated
                }
                websocket.handleMessageToClients(message)

                res.json(taskUpdated)
            })
            .catch(err => res.status(400).json({ error: err.message }))
        } else {
            res.status(400).json({ error: 'Brak danych do aktualizacji' })
        }
    },

    // w metodzie delete
    delete: (req, res) => {
        if(req.query._id) {
            task.model.findOneAndDelete({ _id: req.query._id })
            .then(taskDeleted => {
                // Wysyłanie danych przez WebSocket po usunięciu
                const message = {
                    action: 'delete',
                    type: 'task_update',
                    data: taskDeleted
                }
                websocket.handleMessageToClients(message)

                res.json(taskDeleted)
            })
            .catch(err => res.status(400).json({ error: err.message }))
        } else {
            res.status(400).json({ error: 'Brak danych do usunięcia' })
        }
    }
}
