import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { avatar } from './misc_functions';
import sleeperLogo from '../images/sleeper_icon.png';
const LeaguesLineupCheck = React.lazy(() => import('./Leagues/leaguesLineupCheck'));
const Leagues = React.lazy(() => import('./Leagues/leagues'));
const Players = React.lazy(() => import('./Players/players'));
const Leaguemates = React.lazy(() => import('./Leaguemates/leaguemates'));
const PlayersRankProj = React.lazy(() => import('./Players/playersRank_Proj'));

const View = ({ isLoading, stateAllPlayers, state_user, stateLeagues, stateLeaguemates, statePlayerShares, syncLeague, sendRankEdit }) => {
    const [stateLeaguesFiltered, setStateLeaguesFiltered] = useState([]);
    const [stateLeaguematesFiltered, setStateLeaguematesFiltered] = useState([]);
    const [statePlayerSharesFiltered, setStatePlayerSharesFiltered] = useState([]);
    const [tab, setTab] = useState('Lineup Check');
    const [type1, setType1] = useState('All');
    const [type2, setType2] = useState('All');
    const [includeTaxi, setIncludeTaxi] = useState(1)
    const [rankMargin, setRankMargin] = useState(0)
    const [includeLocked, setIncludeLocked] = useState(1)

    useEffect(() => {
        const fetchFiltered = () => {
            const filter1 = type1
            const filter2 = type2
            const leagues = stateLeagues
            const leaguemates = stateLeaguemates
            const playershares = statePlayerShares
            let filteredLeagues;
            let filteredLeaguemates;
            let filteredPlayerShares;
            switch (filter1) {
                case ('Redraft'):
                    filteredLeagues = leagues.filter(x => x.type !== 2);
                    filteredLeaguemates = leaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues.filter(x => x.type !== 2)
                        }
                    })
                    filteredPlayerShares = playershares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned.filter(x => x.type !== 2)
                        }
                    })
                    break;
                case ('All'):
                    filteredLeagues = leagues;
                    filteredLeaguemates = leaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues
                        }
                    })
                    filteredPlayerShares = playershares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned
                        }
                    })
                    break;
                case ('Dynasty'):
                    filteredLeagues = leagues.filter(x => x.type === 2)
                    filteredLeaguemates = leaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues.filter(x => x.type === 2)
                        }
                    })
                    filteredPlayerShares = playershares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned.filter(x => x.type === 2)
                        }
                    })
                    break;
                default:
                    filteredLeagues = leagues;
                    filteredLeaguemates = leaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues
                        }
                    })
                    filteredPlayerShares = playershares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned
                        }
                    })
                    break;
            }
            let filteredLeagues2 = filteredLeagues
            let filteredLeaguemates2 = filteredLeaguemates
            let filteredPlayerShares2 = filteredPlayerShares
            switch (filter2) {
                case ('Bestball'):
                    filteredLeagues2 = filteredLeagues.filter(x => x.best_ball === 1);
                    filteredLeaguemates2 = filteredLeaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues.filter(x => x.best_ball === 1)
                        }
                    })
                    filteredPlayerShares2 = filteredPlayerShares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned.filter(x => x.best_ball === 1)
                        }
                    })
                    break;
                case ('All'):
                    filteredLeagues2 = filteredLeagues;
                    filteredLeaguemates2 = filteredLeaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues
                        }
                    })
                    filteredPlayerShares2 = filteredPlayerShares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned
                        }
                    })
                    break;
                case ('Standard'):
                    filteredLeagues2 = filteredLeagues.filter(x => x.best_ball !== 1);
                    filteredLeaguemates2 = filteredLeaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues.filter(x => x.best_ball !== 1)
                        }
                    })
                    filteredPlayerShares2 = filteredPlayerShares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned.filter(x => x.best_ball !== 1)
                        }
                    })
                    break;
                default:
                    filteredLeagues2 = filteredLeagues;
                    filteredLeaguemates2 = filteredLeaguemates.map(lm => {
                        return {
                            ...lm,
                            leagues: lm.leagues
                        }
                    })
                    filteredPlayerShares2 = filteredPlayerShares.map(player => {
                        return {
                            ...player,
                            leagues_owned: player.leagues_owned
                        }
                    })
                    break;
            }

            setStateLeaguesFiltered([...filteredLeagues2])
            setStateLeaguematesFiltered([...filteredLeaguemates2])
            setStatePlayerSharesFiltered([...filteredPlayerShares2])
        }

        fetchFiltered()

    }, [type1, type2, stateLeagues])

    const totals = (
        isLoading ? null :
            <table className="summary">
                <tbody>
                    <tr>
                        <td colSpan={6} className="bold">{stateLeaguesFiltered.length} Leagues</td>
                    </tr>
                    <tr>
                        <th>W</th>
                        <th>L</th>
                        <th>T</th>
                        <th>WPCT</th>
                        <th>Pts For</th>
                        <th>Pts Against</th>
                    </tr>
                    <tr>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.wins || 0, 0)
                            }
                        </td>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.losses || 0, 0)
                            }
                        </td>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.ties || 0, 0)
                            }
                        </td>
                        <td>
                            <em>
                                {
                                    (
                                        stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.wins || 0, 0) /
                                        stateLeaguesFiltered.reduce((acc, cur) => acc + (cur.userRoster.settings?.wins || 0) +
                                            (cur.userRoster.settings?.losses || 0) + (cur.userRoster.settings?.ties || 0), 0)
                                    ).toLocaleString("en-US", {
                                        maximumFractionDigits: 4,
                                        minimumFractionDigits: 4
                                    })
                                }
                            </em>
                        </td>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.fpts || 0, 0).toLocaleString("en-US", {
                                    maximumFractionDigits: 2
                                })
                            } pts
                        </td>
                        <td>
                            {
                                stateLeaguesFiltered.reduce((acc, cur) => acc + cur.userRoster.settings?.fpts_against || 0, 0).toLocaleString("en-US", {
                                    maximumFractionDigits: 2
                                })
                            } pts
                        </td>
                    </tr>
                </tbody>
            </table>
    )

    let loadingMessage = (
        <div>
            <h2>
                Loading Leagues...
            </h2>
            <div className='logo_wrapper'>
                <img src={sleeperLogo} alt={'logo'} />
                <div className='z one'>Z</div>
                <div className='z two'>Z</div>
                <div className='z three'>Z</div>
            </div>
        </div>
    )

    let display;
    switch (tab) {
        case 'Lineup Check':
            display = isLoading ? loadingMessage :
                <React.Suspense fallback={loadingMessage}>
                    <LeaguesLineupCheck
                        prop_leagues={stateLeaguesFiltered}
                        allplayers={stateAllPlayers}
                        user_id={state_user.user_id}
                        includeTaxi={includeTaxi}
                        includeLocked={includeLocked}
                        setIncludeLocked={setIncludeLocked}
                        setIncludeTaxi={setIncludeTaxi}
                        rankMargin={rankMargin}
                        setRankMargin={setRankMargin}
                        syncLeague={syncLeague}
                    />
                </React.Suspense>
            break;
        case 'Leagues':
            display = isLoading ? loadingMessage :
                <React.Suspense fallback={loadingMessage}>
                    <Leagues
                        prop_leagues={stateLeaguesFiltered}
                        allplayers={stateAllPlayers}
                        user_id={state_user.user_id}
                        avatar={avatar}
                    />
                </React.Suspense>
            break;
        case 'Players':
            display = isLoading ? loadingMessage :
                <React.Suspense fallback={loadingMessage}>
                    <Players
                        player_shares={statePlayerSharesFiltered}
                        allplayers={stateAllPlayers}
                        user_id={state_user.user_id}
                        sendRankEdit={sendRankEdit}
                    />
                </React.Suspense>
            break;
        case 'Leaguemates':
            display = isLoading ? loadingMessage :
                <React.Suspense fallback={
                    <div className='logo_wrapper'>
                        <div className='z one'>Z</div>
                        <div className='z two'>Z</div>
                        <div className='z three'>Z</div>
                    </div>
                }>
                    <Leaguemates
                        leaguemates={stateLeaguematesFiltered}
                        user_id={state_user.user_id}
                        username={state_user.display_name}
                    />
                </React.Suspense>
            break;
        case 'Rankings':
            display = isLoading ? loadingMessage :
                <React.Suspense fallback={
                    <div className='logo_wrapper'>
                        <div className='z one'>Z</div>
                        <div className='z two'>Z</div>
                        <div className='z three'>Z</div>
                    </div>
                }>
                    <PlayersRankProj
                        allplayers={stateAllPlayers}
                        playershares={statePlayerShares.sort((a, b) => (stateAllPlayers[a.id]?.rank_ecr || 999) - (stateAllPlayers[b.id]?.rank_ecr || 999))}
                        sendRankEdit={sendRankEdit}
                    />
                </React.Suspense >
        default:
            break;
    }


    return <>
        <div id={'view'}>
            <Link to="/" className="home">
                Home
            </Link>
            <i
                onClick={() => setTab('Rankings')}
                className={`fa fa-ranking-star home clickable ${tab === 'Rankings' ? 'active' : null}`}>
            </i>
            {
                state_user === 'Invalid' ? <h1 className="error">USERNAME NOT FOUND</h1> :
                    !state_user ? <h1>Loading...</h1> :
                        <>
                            <div className="heading">
                                <h1>
                                    <p className="image">
                                        {
                                            avatar(state_user.avatar, state_user.display_name, 'user')
                                        }
                                        <strong>
                                            {state_user.display_name}
                                        </strong>
                                    </p>
                                </h1>
                                <div className="navbar">
                                    <button
                                        className={tab === 'Lineup Check' ? 'active clickable' : 'clickable'}
                                        onClick={() => setTab('Lineup Check')}>
                                        Lineups
                                    </button>
                                    <button
                                        className={tab === 'Players' ? 'active clickable' : 'clickable'}
                                        onClick={() => setTab('Players')}>
                                        Players
                                    </button>
                                    <button
                                        className={tab === 'Leagues' ? 'active clickable' : 'clickable'}
                                        onClick={() => setTab('Leagues')}>
                                        Leagues
                                    </button>
                                    <button
                                        className={tab === 'Leaguemates' ? 'active clickable' : 'clickable'}
                                        onClick={() => setTab('Leaguemates')}>
                                        Leaguemates
                                    </button>
                                </div>
                                <div className="switch_wrapper">
                                    <div className="switch">
                                        <button className={type1 === 'Redraft' ? 'active clickable' : 'clickable'} onClick={() => setType1('Redraft')}>Redraft</button>
                                        <button className={type1 === 'All' ? 'active clickable' : 'clickable'} onClick={() => setType1('All')}>All</button>
                                        <button className={type1 === 'Dynasty' ? 'active clickable' : 'clickable'} onClick={() => setType1('Dynasty')}>Dynasty</button>
                                    </div>
                                    <div className="switch">
                                        <button className={type2 === 'Bestball' ? 'active clickable' : 'clickable'} onClick={() => setType2('Bestball')}>Bestball</button>
                                        <button className={type2 === 'All' ? 'active clickable' : 'clickable'} onClick={() => setType2('All')}>All</button>
                                        <button className={type2 === 'Standard' ? 'active clickable' : 'clickable'} onClick={() => setType2('Standard')}>Standard</button>
                                    </div>
                                </div>
                                <div className="summary">
                                    {totals}
                                </div>
                            </div>
                            <div className={'tab'}>
                                {display}
                            </div>
                        </>
            }
        </div>
    </>
}

export default View;