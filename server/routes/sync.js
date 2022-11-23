const { updateAllLeagues, updateAllLeagues_Rosters } = require("./leagues")
const { getPlayersDict, getWeeklyRankings } = require('./playersDict');

const sync_daily = async (app, axios, leagues_table) => {
    const state = await axios.get('https://api.sleeper.app/v1/state/nfl')
    app.set('state', state.data)
    const allplayers = await getPlayersDict(axios, state.data.week)
    app.set('allplayers', allplayers)
    const updateCount = await updateAllLeagues(axios, leagues_table)
    console.log(`${updateCount} leagues updated at ${new Date()}...`)
}

const sync_15min = async (app, axios, leagues_table) => {
    console.log(`league rosters updating at ${new Date()}...`)
    const updateCount = await updateAllLeagues(axios, leagues_table)

    let allplayers = app.get('allplayers')
    const html = await axios.get('https://www.fantasypros.com/nfl/rankings/ppr-superflex.php')
    const weekly_rankings = await getWeeklyRankings(html.data)
    weekly_rankings.map(fantasypros_player => {
        const sleeper_id = Object.keys(allplayers).find(player_id => allplayers[player_id].fantasypros_id === fantasypros_player.player_id?.toString())
        if (sleeper_id) {
            allplayers[sleeper_id] = {
                ...allplayers[sleeper_id],
                week: fantasypros_player?.week,
                rank_ecr: fantasypros_player?.rank_ecr,
                rank_min: fantasypros_player?.rank_min,
                rank_max: fantasypros_player?.rank_max,
                rank_ave: fantasypros_player?.rank_ave,
                rank_std: fantasypros_player?.rank_std,
                player_opponent: fantasypros_player?.player_opponent
            }
        } else {
            console.log(`${fantasypros_player.player_name} not found!!!`)
        }
    })
    app.set('allplayers', allplayers)
    console.log('Weekly Rankings Updated at ' + new Date())
}


module.exports = {
    sync_daily: sync_daily,
    sync_15min: sync_15min
}