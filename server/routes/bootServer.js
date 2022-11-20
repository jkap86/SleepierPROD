const { users } = require('../models/users');
const { leagues } = require('../models/leagues');
const { getPlayersDict } = require('../routes/playersDict');

const bootServer = async (app, axios, db) => {
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')
    app.set('state', state.data)
    const allplayers = await getPlayersDict(axios, state.data.week)
    app.set('allplayers', allplayers)
    const users_table = users(db, state.data.season)
    await users_table.sync()
    const leagues_table = leagues(db, state.data.season)
    await leagues_table.sync()
    app.set('users_table', users_table)
    app.set('leagues_table', leagues_table)
}

module.exports = {
    bootServer: bootServer
}