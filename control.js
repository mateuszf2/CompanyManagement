const auth = require('./auth')
const websocket = require('./websocket')

module.exports = {
    whoGet: (req, res) => {
        
        auth.User.find().then(usersFromDB => {
            users = {}
            usersFromDB.forEach(userFromDB => {
                users[userFromDB.username] = {}
            })
            req.sessionStore.all((err, sessions) => {
                if(err) {
                    res.status(400).json({ error: 'Cannot retrieve sessions' })
                    return
                }
                for(const sessionID in sessions) {
                    const session = sessions[sessionID]
                    if(session.passport && session.passport.user) {
                        const username = session.passport.user
                        if(users[username].sessions) {
                            users[username].sessions++
                        } else {
                            users[username].sessions = 1
                        }
                        if(websocket.map[sessionID]) {
                            users[username].websocket = true
                        }
                    }
                }
                res.json(users)
            })
        })
        .catch(err => res.status(400).json({ error: err.message }))
    }
}