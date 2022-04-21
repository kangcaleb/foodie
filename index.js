/**
 * 
 * Here we set up express and configure it
 */
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname));

const expressSession = require('express-session')
app.use(expressSession({
    name: 'foodie-cookie',
    resave: false,
    saveUninitialized: false,
    secret: "f00d1e",
    cookie: {secure: false}
}))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const cors = require('cors')
app.use(cors())

const path = require('path')

/**
 * 
 * Here we set up the Postgres Client and backend
 */
const { Client } = require('pg');
const client = new Client({
    
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

/**
 *
 * Login the user when provided with the right credentials 
 */
app.post('/login', (req,res) => {
    let name = req.body.email;
    let password = req.body.password;

    res.setHeader("Access-Control-Allow-Origin", "*")

    client.query(`select password from Users where Users.username='${name}'`, (err, result) => {
        if (err) {
            res.status(500).send('Error in getting user')
        } else {
            const passwords = result.rows

            if (passwords) {
                if (passwords.length > 1) {
                    res.status(500).send('Error in getting user'); return
                } else if (passwords.length == 0) {
                    res.status(401).send('Credentials Invalid'); return
                }

                if (passwords[0].password === password) {
                    req.session.user = name
                    res.json(name)
                } else {
                    res.status(401).send('Credentials Invalid')
                }
            } else {
                res.status(500).send('Error in getting user')
            }
        }
    })
})

/**
 * 
 * LOG OUT the user and remove it from the current
 * session
 */
app.get('/logout', (req, res) => {
    delete req.session.user
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.json(true)
})

/**
 * 
 * Get the user for the current session
 */
app.get('/login', (req, res) => {
    const user = req.session.user
    res.json(user)
})

/*
* creates a new user
* */
app.post('/user', (req, res) => {

    const name = req.body.email
    const password = req.body.password

    if (name == null || password == null) {
        res.status(400).send('Fix request')
        return
    }

    client.query(`INSERT INTO USERS VALUES('${name}', '${password}')`, (err, result) => {
        if (err) {
            res.status(500, "Internal Sever Error")
        } else {
            res.send(result)
        }
    })
})

/**get saved recipes data for a particular user */
app.get('/user/:id/data', (req, res) => {
    const user = req.session.user

    client.query(`select * from UserRecipe where username='${user}'`, (err, result) => {
        if (err) {
            res.status(500).send()
        } else {
            res.send(result.rows)
        }
    })
})

/**get notes for a particular recipe for logged in user */
app.get('/notes/:recipeid', (req, res) => {
    const user = req.session.user
    const recipeid = req.params.recipeid

    client.query(`select notes from UserRecipe where username='${user}' and recipeid='${recipeid}'`, (err, result) => {
        if (err) {
            res.status(500)
        } else {
            if (result.rowCount == 0) {
                res.status(500); return
            }
            
            const notes = result.rows[0].notes
            res.json(notes)
        }
    })
})

/**save and post notes for a particular recipe */
app.post('/notes/:recipeid', (req, res) => {
    const user = req.session.user
    const recipeid = req.params.recipeid
    const notes = req.body.notes

    client.query(`update UserRecipe set notes='${notes}' where username='${user}' and recipeid='${recipeid}'`, (err, result) => {
        if (err) {
            res.status(500).send("error")
        } else {
            res.send(true)
        }
    })
})

// Save recipe to logged in user's saved recipe list
app.post('/user/:recipeid/recipe', (req, res) => {
    const user = req.session.user
    const recipeid = req.body.recipeid

    client.query(`insert into UserRecipe values ('${user}', '${recipeid}', '')`, (err, result) => {
        if (err) {
            res.status(500).send(new Error(err.detail))
        } else {
            res.send(result)
        }
    })
})

app.delete('/user/:recipeid/recipe', (req, res) => {
    const user = req.session.user
    const recipeid = req.body.recipeid

    client.query(`delete from UserRecipe where username='${user}' and recipeid='${recipeid}'`, (err, result) => {
        if (err) {
            res.status(500).send(new Error(err.detail))
        } else {
            res.send(result)
        }
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.put('/user/:userid', (req, res) => {
    const user = req.body.username
    const password = req.body.password
    const newPassword = req.body.newPassword

    client.query(`select password from Users where Users.username='${user}'`, (err, result) => {
        if (err) {
            res.status(500).send(Promise.reject("error in getting new user"))
        } else {
            const passwords = result.rows

            if (passwords) {
                if (passwords.length > 1) {
                    res.status(500).send(Promise.reject("error in getting user, shouldn't be returning more that one password for that user")); return
                } else if (passwords.length == 0) {
                    res.status(401).send('Credentials Invalid'); return
                }

                if (passwords[0].password === password) {
                    changeCredentials(user, newPassword, res).then((result) => {
                        res.send(result)
                    }).catch((err) => {
                        res.send(Promise.reject(err))
                    })
                } else {
                    res.status(401).send('Credentials Invalid')
                }
            } else {
                res.status(500).send(Promise.reject("Error in getting user"))
            }
        }
    })
})

app.get('/credentials', (req, res) => {
    const app_id = process.env.app_id
    const app_key = process.env.app_key

    res.send({'app_id': app_id, 'app_key': app_key})
})

const changeCredentials = async function (user, newPassword) {
    const response = await client.query(`update Users set password='${newPassword}' where username='${user}'`)
    return response
}

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('app listening on port: ' + port)
})
