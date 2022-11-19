import React from "react";
import { avatar } from "../misc_functions";
const PlayerLeagues = React.lazy(() => import('./playerLeagues'));

const PlayersOwnership = ({ playershares_display, page, setPage, leaguesVisible, setLeaguesVisible, rowRef, user_id, allplayers }) => {

    const header = (
        <tr className="main_header single">
            <th colSpan={5}>
                Name
            </th>
            <th colSpan={1}>
                #
            </th>
            <th>
                W
            </th>
            <th>
                L
            </th>
            <th colSpan={2}>
                W%
            </th>
            <th colSpan={3}>
                PF
            </th>
            <th colSpan={3}>
                PA
            </th>
        </tr>
    )

    const display = (
        (
            <>
                {
                    page > 1 ?
                        <tbody>
                            <tr
                                className={'clickable'}
                                onClick={() => setPage(prevState => prevState - 1)}
                            >
                                <td colSpan={16}>PREV PAGE</td>
                            </tr>
                        </tbody>
                        :
                        null
                }
                {
                    playershares_display
                        .slice((page - 1) * 25, ((page - 1) * 25) + 25).map((player, index) =>
                            <tbody
                                key={`${player.id}_${index}`}
                                className={leaguesVisible === player.id ? 'active' : null}
                            >
                                <tr>
                                    <td colSpan={16}>
                                        <table className={`table${1}`}>
                                            <tbody>
                                                <tr
                                                    ref={index === 0 ? rowRef : null}
                                                    className={leaguesVisible === player.id ? 'main_row active clickable' : 'main_row clickable'}
                                                    onClick={() => setLeaguesVisible(prevState => prevState === player.id ? '' : player.id)}
                                                >
                                                    <td colSpan={5} className={'left'}>
                                                        <p>
                                                            {
                                                                avatar(player.id, allplayers[player.id].full_name, 'player')
                                                            }
                                                            {allplayers[player.id].full_name} {allplayers[player.id].team}
                                                        </p>
                                                    </td>
                                                    <td colSpan={1}>
                                                        {
                                                            player.leagues_owned.length
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            player.leagues_owned.reduce((acc, cur) => acc + cur.wins, 0)
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            player.leagues_owned.reduce((acc, cur) => acc + cur.losses, 0)
                                                        }
                                                    </td>
                                                    <td colSpan={2}>
                                                        <em>
                                                            {
                                                                (player.leagues_owned.reduce((acc, cur) => acc + cur.wins, 0) /
                                                                    player.leagues_owned.reduce((acc, cur) => acc + cur.losses + cur.wins, 0)).toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 4 })
                                                            }
                                                        </em>
                                                    </td>
                                                    <td colSpan={3}>
                                                        {
                                                            player.leagues_owned.reduce((acc, cur) => acc + cur.fpts, 0).toLocaleString("en-US")
                                                        }
                                                    </td>
                                                    <td colSpan={3}>
                                                        {
                                                            player.leagues_owned.reduce((acc, cur) => acc + cur.fpts_against, 0).toLocaleString("en-US")
                                                        }
                                                    </td>
                                                </tr>
                                                {
                                                    leaguesVisible !== player.id ? null :
                                                        <tr>
                                                            <td colSpan={16}>
                                                                <React.Suspense fallback={
                                                                    <div className='logo_wrapper'>
                                                                        <div className='z one'>Z</div>
                                                                        <div className='z two'>Z</div>
                                                                        <div className='z three'>Z</div>
                                                                    </div>}>
                                                                    <PlayerLeagues
                                                                        type={2}
                                                                        leagues_owned={player.leagues_owned}
                                                                        leagues_taken={player.leagues_taken}
                                                                        leagues_available={player.leagues_available}
                                                                        avatar={avatar}
                                                                        user_id={user_id}
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
                    (((page - 1) * 25) + 25) < playershares_display.length ?
                        <tbody>
                            <tr
                                className={'clickable'}
                                onClick={() => setPage(prevState => prevState + 1)}
                            >
                                <td colSpan={16}>NEXT PAGE</td>
                            </tr>
                        </tbody>
                        :
                        null
                }
            </>
        )
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
export default PlayersOwnership;