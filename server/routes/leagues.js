const { Op } = require("sequelize")


const updateLeaguesUser = async (axios, leagues_table, leagues, user_id) => {
    const league_ids = leagues.map(league => league.league_id)
    let leagues_user_db = await leagues_table.findAll({
        where: {
            league_id: {
                [Op.in]: league_ids
            }
        }
    })
    leagues_user_db = leagues_user_db.map(league => league.dataValues)
    const leagues_to_update = leagues.filter(l => !leagues_user_db.find(l_db => l_db.league_id === l.league_id))

    let new_leagues = []
    await Promise.all(leagues_to_update.map(async league => {
        const [users, rosters] = await Promise.all([
            await axios.get(`http://api.sleeper.app/v1/league/${league.league_id}/users`),
            await axios.get(`http://api.sleeper.app/v1/league/${league.league_id}/rosters`)
        ])

        const new_league = {
            league_id: league.league_id,
            name: league.name,
            avatar: league.avatar,
            best_ball: league.settings.best_ball,
            type: league.settings.type,
            scoring_settings: league.scoring_settings,
            roster_positions: league.roster_positions,
            users: users.data,
            rosters: rosters.data
        }
        new_leagues.push(new_league)
    }))
    await leagues_table.bulkCreate(new_leagues, {
        updateOnDuplicate: ["name", "avatar", "best_ball", "type", "scoring_settings", "roster_positions", "users", "rosters"]
    })


    return (
        [...leagues_user_db, ...new_leagues]
            .map(league => {
                league.rosters
                    ?.sort((a, b) => b.settings.fpts - a.settings.fpts)
                    ?.map((roster, index) => {
                        roster['rank_points'] = index + 1
                        return roster
                    })

                const standings = (
                    league.rosters
                        ?.sort((a, b) => b.settings.wins - a.settings.wins || a.settings.losses - b.settings.losses ||
                            b.settings.fpts - a.settings.fpts)
                        ?.map((roster, index) => {
                            roster['rank'] = index + 1
                            return roster
                        })
                )
                const userRoster = standings?.find(r => r.owner_id === user_id || r.co_owners?.includes(user_id))
                return {
                    ...league,
                    index: leagues.findIndex(l => {
                        return l.league_id === league.league_id
                    }),
                    userRoster: userRoster
                }
            })
            .filter(league => league.userRoster?.players?.length > 0)
            .sort((a, b) => a.index - b.index)
    )
}

const updateAllLeagues = async (axios, leagues_table) => {
    const cutoff = new Date(new Date() - (24 * 60 * 60 * 1000))
    const leagues_to_update = await leagues_table.findAll({
        where: {
            createdAt: {
                [Op.lt]: cutoff
            }
        }
    })

    let updatedLeagues = []
    let i = 0
    while (i < leagues_to_update.length) {
        await Promise.all(leagues_to_update.map(async league_to_update => {
            try {
                const [league, users, rosters] = await Promise.all([
                    await axios.get(`http://api.sleeper.app/v1/league/${league_to_update.dataValues.league_id}`),
                    await axios.get(`http://api.sleeper.app/v1/league/${league_to_update.dataValues.league_id}/users`),
                    await axios.get(`http://api.sleeper.app/v1/league/${league_to_update.dataValues.league_id}/rosters`)
                ])

                updatedLeagues.push({
                    league_id: league_to_update.dataValues.league_id,
                    name: league.data.name,
                    avatar: league.data.avatar,
                    best_ball: league.data.settings.best_ball,
                    type: league.data.settings.type,
                    scoring_settings: league.data.scoring_settings,
                    roster_positions: league.data.roster_positions,
                    users: users.data,
                    rosters: rosters.data,
                    updatedAt: Date.now()
                })
            } catch (error) {
                console.log(error)
            }
        }))
        i += 500
    }

    await leagues_table.bulkCreate(updatedLeagues, {
        updateOnDuplicate: ["name", "avatar", "best_ball", "type", "scoring_settings", "roster_positions", "users", "rosters", "updatedAt"]
    })

    return updatedLeagues.length

}

const updateAllLeagues_Rosters = async (axios, leagues_table) => {
    const cutoff = new Date(new Date() - (10 * 60 * 1000))
    const leagues_to_update = await leagues_table.findAll({
        where: {
            updatedAt: {
                [Op.lt]: cutoff
            }
        }
    })

    let updatedLeagues = []
    let i = 0
    while (i < leagues_to_update.length) {
        await Promise.all(leagues_to_update.slice(i, Math.min(i + 500, leagues_to_update.length)).map(async league_to_update => {
            let rosters;
            try {
                rosters = await axios.get(`http://api.sleeper.app/v1/league/${league_to_update.dataValues.league_id}/rosters`)
                updatedLeagues.push({
                    ...league_to_update.dataValues,
                    rosters: rosters.data,
                    updatedAt: Date.now()
                })
            } catch (error) {
                if (error.request) {
                    console.log(error.request)
                } else if (error.response) {
                    console.log(error.response)
                } else {
                    console.log(error)
                }
            }

        }))
        i += 500
    }

    updatedLeagues = updatedLeagues.map(league => {
        return {
            ...league
        }
    })

    try {
        await leagues_table.bulkCreate(updatedLeagues, {
            updateOnDuplicate: ["rosters", "updatedAt"]
        })
    } catch (error) {
        console.log(error)
    }

    return updatedLeagues.length
}

const updateLeague = async (axios, leagues_table, league_id, user_id) => {
    const [league, rosters, users] = await Promise.all([
        await axios.get(`http://api.sleeper.app/v1/league/${league_id}`),
        await axios.get(`http://api.sleeper.app/v1/league/${league_id}/rosters`),
        await axios.get(`http://api.sleeper.app/v1/league/${league_id}/users`)
    ])
    rosters.data
        .sort((a, b) => b.settings.fpts - a.settings.fpts)
        .map((roster, index) => {
            roster['rank_points'] = index + 1
            return roster
        })

    const standings = (
        rosters.data
            .sort((a, b) => b.settings.wins - a.settings.wins || a.settings.losses - b.settings.losses ||
                b.settings.fpts - a.settings.fpts)
            .map((roster, index) => {
                roster['rank'] = index + 1
                return roster
            })
    )

    const userRoster = standings.find(r => r.owner_id === user_id || r.co_owners?.includes(user_id))

    if (userRoster?.players) {
        const new_league = await leagues_table.update({
            name: league.data.name,
            avatar: league.data.avatar,
            best_ball: league.data.settings.best_ball,
            type: league.data.settings.type,
            scoring_settings: league.data.scoring_settings,
            roster_positions: league.data.roster_positions,
            users: users.data,
            rosters: rosters.data
        }, {
            where: {
                league_id: league_id
            }
        })
        console.log({ sync: new_league })
        return {
            ...league.data,
            rosters: rosters.data,
            users: users.data,
            userRoster: userRoster,
            standings: standings
        }
    }
}

module.exports = {
    updateLeaguesUser: updateLeaguesUser,
    updateAllLeagues: updateAllLeagues,
    updateAllLeagues_Rosters: updateAllLeagues_Rosters,
    updateLeague: updateLeague
}