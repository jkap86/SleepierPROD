const { getPlayersDict, getWeeklyRankings } = require('./playersDict');

const sync_daily = async (app, axios, leagues_table) => {
    console.log(`Begin Daily Sync at ${new Date()}`)
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')
    app.set('state', state.data)
    const allplayers = await getPlayersDict(axios, state.data.week)
    app.set('allplayers', allplayers)
    console.log(`Daily Sync completed at ${new Date()}`)
    console.log(`Next Sync scheduled for ${new Date(Date.now() + (24 * 60 * 60 * 1 * 1000))}`)
}


module.exports = {
    sync_daily: sync_daily
}