const Sequelize = require('sequelize')

const allplayers = (db) => {
    return db.define('allplayers', {
        sleeper_id: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        full_name: {
            type: Sequelize.STRING
        },
        team: {
            type: Sequelize.STRING
        },
        position: {
            type: Sequelize.STRING
        },
        college: {
            type: Sequelize.STRING
        },
        age: {
            type: Sequelize.INTEGER
        },
        draft_pick: {
            type: Sequelize.INTEGER
        },
        draft_round: {
            type: Sequelize.INTEGER
        },
        draft_year: {
            type: Sequelize.INTEGER
        },
        fantasypros_id: {
            type: Sequelize.STRING
        },
        gametime: {
            type: Sequelize.DATE
        },
        player_opponent: {
            type: Sequelize.STRING
        },
        rank_ecr: {
            type: Sequelize.INTEGER
        },
        rank_max: {
            type: Sequelize.INTEGER
        },
        rank_min: {
            type: Sequelize.INTEGER
        },
        rotowire_id: {
            type: Sequelize.STRING
        },
        week: {
            type: Sequelize.INTEGER
        }
    })
}

module.exports = {
    allplayers: allplayers
}
