const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname));

const path = require('path')

const cors = require('cors')
app.use(cors())

const expressSession = require('express-session')
app.use(expressSession({
    name: 'foodie-cookie',
    resave: false,
    saveUninitialized: false,
    secret: "f00d1e",
    cookie: {secure: false}
}))

/** Here we set up the POSTGRES Client*/
const { Client } = require('pg');
const client = new Client({
    
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();


const User = require('./backend/user.js')

/*
* Here are endpoints regarding login and user information.
* Right now they are all relative to the base url: http//localhost:3000
*
* */

app.get('/home', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.json('This is a test to see that my express backend is up and running. This is the endpoint for the homepage')
})

app.get('/userids', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.json(User.getAllUserIds())
})

app.get('/users', (req, res) => {
    let users = User.getAllUsers()
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.json(users)
})

/*This endpoint requires the user and password information to be in the request body
* This information needs to be passed in as key values pairs with the keys being
* email and password respectively. content type for request must be form-url-encoded
* */
app.post('/login', (req,res) => {
    let name = req.body.email;
    let password = req.body.password;

    res.setHeader("Access-Control-Allow-Origin", "*")

    client.query(`select password from Users where Users.username='${name}'`, (err, result) => {
        if (err) {
            res.status(500).send('Error in getting user')
        } else {
            console.log(result)
            const passwords = result.rows

            if (passwords) {
                if (passwords.length > 1) {
                    res.status(500).send('Error in getting user'); return
                } else if (passwords.length == 0) {
                    res.status(401).send('Credentials Invalid'); return
                }

                console.log(passwords[0].password)
                console.log(password)
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

/*
* log out the user
* */
app.get('/logout', (req, res) => {
    delete req.session.user
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.json(true)
})

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

/*
* gets the user info given a user id passed in as a parameter
* */
app.get('/user/:id', (req, res) => {
    let user = User.getUser(req.params.id)
    if (user == null) {
        res.send(404).send('bad user request')
        return
    }

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send(user)
})

app.get('/users-data', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.json(User.getAllUserData())
})

app.get('/user/:id/data', (req, res) => {
    const id = req.params.id

    if (userData.has(id)) {
        const data = userData.get(req.params.id, ()=>{})
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.json(data)
    } else {
        res.send(404).send('bad user data request')
    }
})

app.post('/user/:id/recipe', (req, res) => {

    const id = req.params.id
    const recipe = req.body.recipe

    if (User.getUser(id) != null) {

        const userdata = userData.get(id)

        if (userdata == null) {
            userData.set(id.toString(), {
                id: parseInt(id),
                recipes: [recipe]
            })
            userData.save()
            res.json(userData.get(id))
            return
        }

        // TODO Defensive Programing for valid recipe, if time

        userdata.recipes.push(recipe)
        userData.set(userdata.id.toString(), userdata)
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.json(userdata)
    } else {
        res.status(404).send('no user')
    }
})

app.delete('/user/:id/recipe', (req, res) => {
    const id = req.params.id
    const recipe = req.body.recipe

    if (User.getUser(id) != null) {
        const user = User.getUserData(id)

        // TODO Defensive Programing for valid recipe, if time
        const updated = user.recipes.filter(rec => rec.uri !== recipe.uri)

        if (updated.length != user.recipes.length) {
            user.recipes = updated
            userData.set(user.id.toString(), user)

            res.setHeader("Access-Control-Allow-Origin", "*")
            res.json(user)
        } else {
            res.status(404).send('bad recipe' + recipe.uri)
        }
    } else {
        res.send(404).send('no user')
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.put('/user/:id', (req, res) => {
    const id = req.params.id
    const email = req.body.email
    const newEmail = req.body.newEmail
    const password = req.body.password
    const newPassword = req.body.newPassword

    if (User.getUser(id) != null) {

        if (verifyCredentials(email, password) == 1) {
            User.setUserData(id, {
                id: id,
                email: newEmail,
                password: newPassword
            })

            res.json(User.getUser(id))
        } else {
            res.status(404).send("invalid credentials")
        }
    } else {
        res.status(404).send('no user found')
    }


})

/**Used in login endpoint to verify the password for the username*/
const verifyCredentials = (name, password) => {
    client.query(`select password from Users where Users.username='${name}'`, (err, res) => {
        if (err) {
            return -1
        } else {
            console.log(res)
            const passwords = res.rows
            if (passwords) {
                if (passwords.length > 1) {
                    return -1
                } else if (passwords.length == 0) {
                    return 0
                }

                if (passwords[0].password === password) {
                    return 1
                } else {
                    return 0
                }
            } else {
                return -1
            }
        }
    })
}

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('app listening on port: ' + port)
})
