const userData = require('data-store')({ path: process.cwd() + '/data/users.json' })

let User = class {
    constructor(id, email, password) {
        this.id=id; this.email=email; this.password=password;
    }
}

User.getAllUserIds = () => {
    return Object.keys(userData.data).map(id => parseInt(id))
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

    userData.set(id.toString(), user)
    return user
}

User.getUser = (id) => {
    const user = userData.get(id)
    return user
}

User.getAllUsers = () => {
    return Object.values(userData.data)
}

module.exports = User