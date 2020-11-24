const accountData = require('data-store')({ path: process.cwd() + '/data/accounts.json' })
const userData = require('data-store')({ path: process.cwd() + '/data/user-data.json' })

let User = class {
    constructor(id, email, password) {
        this.id=id; this.email=email; this.password=password;
    }
}

User.getAllUserIds = () => {
    return Object.keys(accountData.data).map(id => parseInt(id))
}

User.createUser = (name, password) => {
    const ids = User.getAllUserIds()

    const max_id = ids.reduce((max, curr) => {
        if (curr > max) {
            return curr
        } else {
            return max
        }
    }, -1)

    const id = max_id + 1
    let user = new User(id, name, password)

    accountData.set(id.toString(), user)
    return user
}

User.getUser = (id) => {
    const user = accountData.get(id)
    return user
}

User.getAllUsers = () => {
    return Object.values(accountData.data)
}

User.getAllUserData = () => {
    return Object.values(userData.data)
}

User.getUserData = (id) => {
    return userData.get(id)
}

User.setUserData = (id, data) => {
    accountData.set(id, data)
}

module.exports = User