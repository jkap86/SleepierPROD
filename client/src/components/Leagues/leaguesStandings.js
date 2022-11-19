import React from "react";
import { avatar } from "../misc_functions";
const LeagueRosters = React.lazy(() => import('./leagueRosters'));

const LeaguesStandings = ({ sortLeagues, leagues_display, page, setPage, rowRef, rostersVisible, setRostersVisible, user_id, allplayers }) => {

    const header = (
        <>
            <tr className="main_header single">
                <th colSpan={4}
                    className={'clickable'}
                    onClick={() => sortLeagues('League')}
                >
                    League
                </th>
                <th colSpan={3}
                    className={'clickable'}
                    onClick={() => sortLeagues('Record')}
                >
                    Record
                </th>
                <th colSpan={4}
                    className={'clickable'}
                    onClick={() => sortLeagues('PF')}
                >
                    PF - PA
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                    onClick={() => sortLeagues('Rank (Ovr)')}
                >
                    Rank (Ovr)
                </th>
                <th colSpan={1}
                    className={'small clickable'}
                    onClick={() => sortLeagues('Rank (PF)')}
                >
                    Rank (PF)
                </th>
            </tr>
        </>
    )

    const display = (
        <>
            {
                page > 1 ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState - 1)}
                        >
                            <td colSpan={13}>PREV PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
            {
                leagues_display
                    .slice(Math.max((page - 1) * 25, 0), ((page - 1) * 25) + 25)
                    .map((league, index) =>
                        <tbody
                            key={`${league.league_id}_${index}`}
                            className={rostersVisible === league.league_id ? 'active' : null}
                        >
                            <tr>
                                <td colSpan={13} >
                                    <table className={`table${1}`}>
                                        <tbody>
                                            <tr
                                                ref={index === 0 ? rowRef : null}
                                                className={rostersVisible === league.league_id ? 'main_row active clickable' : 'main_row clickable'}
                                                onClick={() => setRostersVisible(prevState => prevState === league.league_id ? '' : league.league_id)}
                                            >
                                                <td colSpan={4} className={'left'}>
                                                    <p>
                                                        {
                                                            avatar(league.avatar, league.name, 'league')
                                                        }
                                                        {league.name}
                                                    </p>
                                                </td>
                                                <td colSpan={3}>
                                                    {
                                                        `${league.userRoster.settings.wins}-${league.userRoster.settings.losses}${league.userRoster.settings.ties > 0 ? `-${league.userRoster.settings.ties}` : ''}`
                                                    }
                                                    &nbsp;&nbsp;
                                                    <em>
                                                        {
                                                            ((league.userRoster.settings.wins / (league.userRoster.settings.wins + league.userRoster.settings.losses + league.userRoster.settings.ties)) || 0).toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 4 })
                                                        }
                                                    </em>
                                                </td>
                                                <td colSpan={4}>
                                                    {
                                                        league.userRoster.settings.fpts?.toLocaleString("en-US")
                                                    } - {
                                                        league.userRoster.settings.fpts_against?.toLocaleString("en-US") || 0
                                                    }
                                                </td>
                                                <td>
                                                    <p
                                                        className={
                                                            (league.userRoster.rank / league.rosters?.length) <= .25 ? 'green' :
                                                                (league.userRoster.rank / league.rosters?.length) >= .75 ? 'red' :
                                                                    null
                                                        }
                                                    >
                                                        {
                                                            league.userRoster.rank
                                                        }
                                                    </p>
                                                </td>
                                                <td>
                                                    <p
                                                        className={
                                                            (league.userRoster.rank_points / league.rosters?.length) <= .25 ? 'green' :
                                                                (league.userRoster.rank_points / league.rosters?.length) >= .75 ? 'red' :
                                                                    null
                                                        }
                                                    >
                                                        {
                                                            league.userRoster.rank_points
                                                        }
                                                    </p>
                                                </td>
                                            </tr>
                                            {
                                                rostersVisible !== league.league_id ? null :
                                                    <tr>
                                                        <td colSpan={13}>
                                                            <div className={`nav2`}></div>
                                                            <React.Suspense fallback={
                                                                <div className='logo_wrapper'>
                                                                    <div className='z one'>Z</div>
                                                                    <div className='z two'>Z</div>
                                                                    <div className='z three'>Z</div>
                                                                </div>}>
                                                                <LeagueRosters
                                                                    type={2}
                                                                    rosters={league.rosters}
                                                                    users={league.users}
                                                                    avatar={avatar}
                                                                    roster_positions={league.roster_positions}
                                                                    user_id={user_id}
                                                                    allplayers={allplayers}
                                                                />
                                                            </React.Suspense>
                                                        </td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    )
            }
            {
                (((page - 1) * 25) + 25) < leagues_display.length ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState + 1)}
                        >
                            <td colSpan={13}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </>
    )

    return <>
        <table className="main">
            <thead className="main">
                {header}
            </thead>
            {display}
        </table>
    </>
}
export default LeaguesStandings;