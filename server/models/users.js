const Sequelize = require('sequelize')

const users = (db, season) => {
    return db.define('users', {
        user_id: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING
        },
        avatar: {
            type: Sequelize.STRING
        },
        [`${season}_leagues`]: {
            type: Sequelize.JSONB
        }
    })
}

module.exports = {
    users: users
}