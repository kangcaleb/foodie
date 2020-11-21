const app_id = 'e8ceb929'
const app_key = '1235bcdb8e7bab0323df3ae7ad7587db'

const getCurrentUser = async () => {
    const result = await fetch('http://localhost:3000/current-user', {
        method: 'GET'
    })
    return result.json()
}