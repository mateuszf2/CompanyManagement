const uuid = require('uuid')

const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
    _id: { type: String, default: uuid.v4 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: true, transform: v => v.toISOString().slice(0, 10) }
}, {
    versionKey: false,
    additionalProperties: false
})

mongoose.connect('mongodb://localhost:27017/pai2024')
.then(conn => {
    console.log('Połączenie z bazą danych nawiązane')

    const Person = conn.model('Person', personSchema)
    const person = new Person({
        firstName: 'Mariusz',
        lastName: 'Jarocki',
        birthDate: '1969-03-24'
    })
    let err = person.validateSync()
    if(err) {
        console.error('Dokument nie spełnia założeń modelu', err.message)
        process.exit(0)
    }
    person.save().catch(err => {
        console.error('Nieudane zapisanie danych', err.message)
    }).then(row => {
        console.log('Zapisano w bazie', row)
        Person.find({})
        .then(rows => {
            console.log('Aktualny stan kolekcji', Person.collection.name, rows)
        })
        .catch(err => {
            console.error('Nieudane pobranie danych', err.message)
        })    
    })

})
.catch(err => {
    console.error('Połączenie z bazą danych nieudane', err)
})