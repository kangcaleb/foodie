const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const expressSession = require('express-session')
app.use(expressSession({
    name: 'CalebSessionCookie',
    secret: "express session password",
    resave: false,
    saveUninitialized: false
}))


const User = require('./user.js')
const userData = require('data-store')({ path: process.cwd() + '/data/user-data.json' })


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
    let email = req.body.email;
    let password = req.body.password;

    let user = User.getAllUsers().filter(user => user.email === email)

    if (user.length == 0) {
        res.status(404).send("Not found");
        return;
    }
    if (user[0].password == password) {
        console.log("User " + user[0].email + " credentials valid");
        req.session.user = user[0];
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.json(true);
        return;
    }
    res.status(403).send("Unauthorized");
})

/*
* log out the user
* */
app.get('/logout', (req, res) => {
    delete req.session.user
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.json(true)
})

app.get('/current-user', (req, res) => {
    const user = req.session.user
    console.log('current user endpoint hit')
    console.log(req)

    res.setHeader("Access-Control-Allow-Origin", "*")
    if (user) {
        res.json(user)
    } else {
        res.send(400).send('error')
    }

})

/*
* creates a new user
* */
app.post('/user', (req, res) => {

    const email = req.body.email
    const password = req.body.password

    let user = User.createUser(email, password)

    if (user == null) {
        res.status(400).send('Fix request')
        return
    }

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.json(user)
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
    console.log('hit user data endpoint')
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
    const recipe = req.query.recipe

    if (userData.has(id)) {
        const user = User.getUserData(id)

        // TODO Defensive Programing for valid recipe, if time
        user.recipes.push(recipe)
        userData.set(user.id.toString(), user)
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.json(user)
    } else {
        res.send(404).send('no user')
    }
})

app.delete('/user/:id/recipe', (req, res) => {
    const id = req.params.id
    const recipe = req.query.recipe
    console.log(recipe)

    if (userData.has(id)) {
        const user = User.getUserData(id)

        // TODO Defensive Programing for valid recipe, if time
        console.log(user.recipes)

        const updated = user.recipes.filter(rec => rec != recipe)

        if (updated.length != user.recipes.length) {
            user.recipes = updated
            userData.set(user.id.toString(), user)

            res.setHeader("Access-Control-Allow-Origin", "*")
            res.json(user)
        } else {
            res.send(404).send('bad recipe')
        }
    } else {
        res.send(404).send('no user')
    }
})

const port = 3000
app.listen(port, () => {
    console.log('app listening on port: ' + port)
})




