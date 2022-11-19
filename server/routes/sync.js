const { updateAllLeagues } = require("./leagues")
const { getWeeklyRankings } = require('./playersDict');

const sync_daily = async (axios, leagues_table) => {
    const date = new Date()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const delay = ((Math.max(4 - hour, 27 - hour) * 60) + (60 - minute)) * 60 * 1000
    setTimeout(async () => {
        const updateCount = await updateAllLeagues(axios, leagues_table)
        console.log(`${updateCount} leagues updated at ${new Date()}...`)
        setInterval(async () => {
            const updateCount = await updateAllLeagues(axios, leagues_table)
            console.log(`${updateCount} leagues updated at ${new Date()}...`)
        }, 24 * 60 * 60 * 1000)
    }, delay)
}

const sync_15min = (app, axios) => {
    setInterval(async () => {
        let allplayers = app.get('allplayers')
        const html = await axios.get('https://www.fantasypros.com/nfl/rankings/ppr-superflex.php')
        const weekly_rankings = await getWeeklyRankings(html.data)
        weekly_rankings.map(fantasypros_player => {
            const sleeper_id = Object.keys(allplayers).find(player_id => allplayers[player_id].fantasypros_id === fantasypros_player.player_id.toString())
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
    }, 15 * 60 * 1 * 1000)
}


module.exports = {
    sync_daily: sync_daily,
    sync_15min: sync_15min
}