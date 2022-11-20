import { useParams } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import sleeperLogo from '../images/sleeper_icon.png';
import View from "./view";

const Main = () => {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [stateAllPlayers, setStateAllPlayers] = useState({});
    const [state_user, setState_User] = useState(false);
    const [stateLeagues, setStateLeagues] = useState([]);
    const [stateLeaguemates, setStateLeaguemates] = useState([]);
    const [statePlayerShares, setStatePlayerShares] = useState([]);

    console.log({
        allplayers: stateAllPlayers,
        leagues: stateLeagues,
        players: statePlayerShares,
        leaguemates: stateLeaguemates
    })

    const getPlayerShares = (leagues, user_id) => {
        const getPlayerCount = (players, user_id, leagues) => {
            let playerShares = [];
            players.map(player => {
                const index = playerShares.findIndex(obj => {
                    return obj.id === player.id
                })
                if (index === -1) {
                    let leagues_owned = players.filter(x => x.id === player.id && x.manager?.user_id === user_id)
                    let leagues_taken = players.filter(x => x.id === player.id && x.manager?.user_id !== user_id)
                    playerShares.push({
                        id: player.id,
                        leagues_owned: leagues_owned,
                        leagues_taken: leagues_taken,
                        leagues_available: leagues.filter(x =>
                            !leagues_owned.find(y => y.league_id === x.league_id) &&
                            !leagues_taken.find(y => y.league_id === x.league_id)
                        )
                    })
                }
            })
            return playerShares
        }

        let players_all = leagues.map(league => {
            return league.rosters.map(roster => {
                return roster.players?.map(player_id => {
                    return {
                        id: player_id,
                        status: (
                            roster.starters?.includes(player_id) ?
                                'Starter' :
                                roster.taxi?.includes(player_id) ?
                                    'Taxi' :
                                    roster.reserve?.includes(player_id) ?
                                        'IR' :
                                        'Bench'
                        ),
                        league_id: league.league_id,
                        league_name: league.name,
                        league_avatar: league.avatar,
                        rosters: league.rosters,
                        userRoster: league.userRoster,
                        users: league.users,
                        scoring_settings: league.scoring_settings,
                        rank: roster.rank,
                        rank_pts: roster.rank_points,
                        roster: roster,
                        roster_positions: league.roster_positions,
                        type: league.type,
                        best_ball: league.best_ball,
                        manager: (league.users.find(x =>
                            x.user_id === roster.owner_id
                        )) || (league.users.find(x =>
                            roster.co_owners?.includes(x.user_id)
                        )) || {
                            display_name: 'Orphan',
                            user_id: 0
                        },
                        wins: roster.settings.wins,
                        losses: roster.settings.losses,
                        ties: roster.settings.ties,
                        fpts: parseFloat(`${roster.settings.fpts}.${roster.settings.fpts_decimal}`),
                        fpts_against: parseFloat(`${roster.settings.fpts_against}.${roster.settings.fpts_against_decimal}`)
                    }
                })
            })
        }).flat(2)
        const playersCount = getPlayerCount(players_all.filter(x => x !== undefined), user_id, leagues)
        setStatePlayerShares(playersCount)
    }

    const getLeaguemates = (leagues, user_id) => {
        const getLmCount = (leaguemates) => {
            let leaguematesCount = [];
            leaguemates.forEach(lm => {
                const index = leaguematesCount.findIndex(obj => {
                    return obj.user_id === lm.user_id
                })
                if (index === -1) {
                    leaguematesCount.push({
                        user_id: lm.user_id,
                        display_name: lm.display_name,
                        avatar: lm.avatar,
                        leagues: [lm.league]
                    })
                } else {
                    leaguematesCount[index].leagues.push(lm.league)
                }
            })
            return leaguematesCount
        }

        let leaguemates_all = [];
        leagues.map(league => {
            let userRoster = league.rosters.find(x => x.owner_id === user_id || x.co_owners?.includes(user_id))

            if (userRoster) {
                return league.users.map(user => {
                    let lmRoster = league.rosters.find(x => x.owner_id === user.user_id || x.co_owners?.includes(user.user_id))

                    if (lmRoster) {
                        return leaguemates_all.push({
                            ...user,
                            league: {
                                ...league,
                                lmroster: lmRoster,
                                roster: userRoster
                            }
                        })
                    }
                    return console.log('No Leaguemate Roster')
                })
            }

            return console.log('No User Roster')

        })

        let lmCount = getLmCount(leaguemates_all.filter(x => x !== '0'));

        setStateLeaguemates(lmCount);
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            const user = await axios.get('/user', {
                params: {
                    username: params.username
                }
            })
            if (user.data?.leagues) {
                const allplayers = await axios.get('/allplayers')

                setState_User(user.data.user)

                setStateLeagues(user.data.leagues)
                getPlayerShares(user.data.leagues, user.data.user.user_id)
                getLeaguemates(user.data.leagues, user.data.user.user_id)

                setStateAllPlayers(allplayers.data)

            } else {
                setState_User('Invalid')
            }
            setIsLoading(false)
        }

        fetchData()

    }, [params.username])

    const syncLeague = async (league_id, user_id) => {
        const sync = await axios.get('/syncleague', {
            params: {
                league_id: league_id,
                user_id: user_id
            }
        })
        const leagues = stateLeagues
        const leaguesSynced = leagues.map(league => {
            if (league.league_id === sync.data.league_id) {
                league = {
                    ...sync.data,
                    index: league.index
                }
            }
            return league
        })
        setStateLeagues([...leaguesSynced])
        getPlayerShares(leaguesSynced.filter(x => x !== null), state_user.user_id)
        getLeaguemates(leaguesSynced.filter(x => x !== null), state_user.user_id)
    }


    return !isLoading && state_user === 'Invalid' ? <h1>USERNAME NOT FOUND</h1> :
        isLoading ?
            <div className='logo_wrapper'>
                <img src={sleeperLogo} alt={'logo'} />
                <div className='z one'>Z</div>
                <div className='z two'>Z</div>
                <div className='z three'>Z</div>
            </div>
            :
            <View
                stateAllPlayers={stateAllPlayers}
                state_user={state_user}
                stateLeagues={stateLeagues}
                stateLeaguemates={stateLeaguemates}
                statePlayerShares={statePlayerShares}
                syncLeague={syncLeague}
                sendRankEdit={setStateAllPlayers}
            />
}

export default Main;