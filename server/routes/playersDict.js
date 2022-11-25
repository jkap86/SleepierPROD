const { read, utils } = require('xlsx');
const cheerio = require('cheerio')

const getPlayersDict = async (axios, week) => {
    const [sleeper_players, dynasty_process, fantasypros, schedule] = await Promise.all([
        await axios.get('https://api.sleeper.app/v1/players/nfl'),
        await axios.get('https://raw.githubusercontent.com/dynastyprocess/data/master/files/db_playerids.csv', { responseType: 'arraybuffer' }),
        await axios.get('https://www.fantasypros.com/nfl/rankings/ppr-superflex.php'),
        await axios.get(`https://api.sportsdata.io/v3/nfl/scores/json/Schedules/%7B2022%7D?key=d5d541b8c8b14262b069837ff8110635`)
    ])
    let gametimes = {}
    schedule.data.filter(x => x.Week === week).map(s => {
        gametimes = {
            ...gametimes,
            [s.HomeTeam]: new Date(s.Date) || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            [s.AwayTeam]: new Date(s.Date) || new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }
    })

    const workbook = read(dynasty_process.data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const players_dict = utils.sheet_to_json(worksheet).filter(j => j.sleeper_id)
    const sleeper_active = Object.keys(sleeper_players.data)
        .filter(p =>
            sleeper_players.data[p].active === true &&
            ['QB', 'RB', 'FB', 'WR', 'TE'].includes(sleeper_players.data[p]?.position)
        )
    const weekly_rankings = await getWeeklyRankings(fantasypros.data)
    let allplayers = {}
    sleeper_active.map(sleeper_id => {
        const sleeper_player = sleeper_players.data[sleeper_id]
        const dynProc_player = players_dict.find(x => x.sleeper_id.toString() === sleeper_id.toString())
        const fantasypros_player = weekly_rankings.find(x => x.player_id.toString() === dynProc_player?.fantasypros_id.toString())

        allplayers[sleeper_id] = {
            full_name: sleeper_player?.full_name,
            searchName: sleeper_player?.search_full_name,
            position: sleeper_player?.position,
            team: sleeper_player?.team || 'FA',
            fantasypros_id: dynProc_player?.fantasypros_id.toString(),
            rotowire_id: dynProc_player?.rotowire_id.toString(),
            age: dynProc_player?.age,
            draft_year: dynProc_player?.draft_year,
            draft_round: dynProc_player?.draft_round,
            draft_pick: dynProc_player?.draft_pick,
            college: dynProc_player?.college,
            week: fantasypros_player?.week,
            rank_ecr: fantasypros_player?.rank_ecr || 999,
            rank_min: fantasypros_player?.rank_min,
            rank_max: fantasypros_player?.rank_max,
            rank_ave: fantasypros_player?.rank_ave,
            rank_std: fantasypros_player?.rank_std,
            player_opponent: fantasypros_player?.player_opponent,
            gametime: gametimes[sleeper_player?.team]
        }

    })
    return allplayers
}

const getWeeklyRankings = async (html) => {
    let script = []
    let $ = cheerio.load(html)
    const header = $('.rankings-page__heading').text()
    const week = header.match(/(?<=Week )[0-9]+(?= \()/g)
    $('script').each((i, elem) => {
        if ($(elem).text().includes("var ecrData")) {
            script.push({
                index: i,
                text: $(elem).text()
            })
        }
    })

    let rankings = script[0].text.substring(
        script[0].text.indexOf('[') + 1,
        script[0].text.indexOf(']')
    )
        .replace(/},{/g, "}-----{")
        .split('-----')

    let rankings_parsed = rankings.map(rank => {
        let parsed = JSON.parse(rank)
        return parsed
    })

    return rankings_parsed
}


module.exports = {
    getPlayersDict: getPlayersDict,
    getWeeklyRankings: getWeeklyRankings
}