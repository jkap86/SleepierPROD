
const getUser = async (axios, username) => {
    let user;
    try {
        user = await axios.get(`https://api.sleeper.app/v1/user/${username}`)
        return user.data
    } catch (error) {
        console.log(error)
        return 'Invalid'
    }
}

const updateUser = async (axios, users_table, user, season) => {
    const leagues = await axios.get(`https://api.sleeper.app/v1/user/${user.user_id}/leagues/nfl/${season}`)
    const league_ids = []
    leagues.data.map((league, index) => {
        return league_ids[index] = league.league_id
    })
    const [user_db, created] = await users_table.findOrCreate({
        where: { user_id: user.user_id },
        defaults: {
            username: user.display_name,
            avatar: user.avatar,
            [`${season}_leagues`]: league_ids
        }
    })
    return {
        user: user_db,
        leagues: leagues.data
    }
}

module.exports = {
    getUser: getUser,
    updateUser: updateUser
}