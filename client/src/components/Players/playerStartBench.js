import React, { useEffect, useState } from "react";
import { avatar } from "../misc_functions";
import { getStartedOver, getBenchedOver } from '../projections_stats';

const PlayerStartBench = ({ type, player_id, leagues_starting, leagues_benched, user_id, player_rank, allplayers }) => {
    const [leaguesStarting, setLeaguesStarting] = useState([])
    const [leaguesBenched, setLeaguesBenched] = useState([])
    const [tab, setTab] = useState('Owned')
    const [rostersVisible, setRostersVisible] = useState([]);
    const [page, setPage] = useState(1);

    const toggleRosters = (league_id) => {
        let rv = rostersVisible;
        if (rv.includes(league_id)) {
            rv = rv.filter(x => x !== league_id)
        } else {
            rv.push(league_id)
        }
        setRostersVisible([...rv])
    }

    useEffect(() => {
        setLeaguesStarting(leagues_starting)
        setLeaguesBenched(leagues_benched)
    }, [leagues_starting, leagues_benched])



    return <>
        <div className={`nav${type}`}>

        </div>
        <table className={`table${type} lineup`}>
            <thead>
                <tr className={'single'}>
                    <th colSpan={1}>Slot</th>
                    <th colSpan={4}>Starting</th>
                    <th colSpan={1}>Subs</th>
                </tr>
            </thead>
            {
                leaguesStarting.map((ls, index) =>
                    <tbody key={`${ls.league_id}_${index}`}>
                        <tr>
                            <td colSpan={6}>
                                <table className={`table2`}>
                                    <tbody>
                                        <tr
                                            className={rostersVisible.includes(ls.league_id) ? 'active clickable' : 'clickable'}
                                            onClick={() => toggleRosters(ls.league_id)}
                                        >
                                            <td colSpan={1}>
                                                {ls.roster_positions[
                                                    ls.userRoster.starters.indexOf(player_id)
                                                ].replace('SUPER_FLEX', 'SF')}
                                            </td>
                                            <td colSpan={4} className={'left'}>
                                                <p>
                                                    {
                                                        avatar(ls.league_avatar, ls.league_name, 'league')
                                                    }
                                                    {ls.league_name}
                                                </p>
                                            </td>
                                            <td>
                                                {getStartedOver(
                                                    player_id, ls.userRoster, ls.roster_positions, allplayers, player_rank
                                                )?.length || 0}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        {
                            !rostersVisible.includes(ls.league_id) ? null :
                                <tr>
                                    <td colspan={6}>
                                        <table className={`table3`}>
                                            <tbody>
                                                {
                                                    getStartedOver(
                                                        player_id, ls.userRoster, ls.roster_positions, allplayers, player_rank
                                                    )?.map(sub =>
                                                        <tr>
                                                            <td colSpan={3} className={'left'}>
                                                                <p>
                                                                    {`${allplayers[sub]?.position} ${allplayers[sub]?.full_name} ${allplayers[sub]?.team || 'FA'}`}
                                                                </p>
                                                            </td>
                                                            <td colSpan={1}>
                                                                {allplayers[sub]?.rank_ecr || 999}
                                                            </td>
                                                            <td colSpan={1}>
                                                                {allplayers[sub]?.pos_rank || 999}
                                                            </td>
                                                        </tr>
                                                    )
                                                    ||
                                                    <tr>
                                                        <td>No Better Options</td>
                                                    </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>

                        }
                    </tbody>
                )
            }
        </table>
        <table className={`table${type} subs`}>
            <thead>
                <tr className={'single'}>
                    <th colSpan={3}>Benched</th>
                    <th colSpan={1}>Slots</th>
                </tr>
            </thead>
            {
                leaguesBenched.map((ls, index) =>
                    <tbody key={`${ls.league_id}_${index}`}>
                        <tr>
                            <td colSpan={4}>
                                <table className={`table2`}>
                                    <tbody>
                                        <tr
                                            className={rostersVisible.includes(ls.league_id) ? 'active clickable' : 'clickable'}
                                            onClick={() => toggleRosters(ls.league_id)}
                                        >
                                            <td colSpan={3} className={'left'}>
                                                <p>
                                                    {
                                                        avatar(ls.league_avatar, ls.league_name, 'league')
                                                    }
                                                    {ls.league_name}
                                                </p>
                                            </td>
                                            <td>
                                                {
                                                    getBenchedOver(
                                                        player_id, ls.userRoster, ls.roster_positions, allplayers, player_rank
                                                    )?.length || 0
                                                }
                                            </td>
                                        </tr>
                                        {
                                            !rostersVisible.includes(ls.league_id) ? null :
                                                <tr>
                                                    <td colspan={4}>
                                                        <table className={`table3`}>
                                                            <tbody>
                                                                {
                                                                    getBenchedOver(
                                                                        player_id, ls.userRoster, ls.roster_positions, allplayers, player_rank
                                                                    )?.map((player, index) =>
                                                                        <tr key={`${player}_${index}`}>
                                                                            <td colSpan={2}>
                                                                                {player.slot}
                                                                            </td>
                                                                            <td colSpan={5} className={'left'}>
                                                                                <p>
                                                                                    {allplayers[player.starter]?.full_name || 'Empty Slot'}
                                                                                </p>
                                                                            </td>
                                                                            <td colSpan={3}>
                                                                                {player.rank} ovr
                                                                                <br />
                                                                                {player.rank_pos}
                                                                            </td>
                                                                        </tr>
                                                                    ) ||
                                                                    <tr>
                                                                        <td>No Lower Ranked Starters</td>
                                                                    </tr>
                                                                }
                                                            </tbody>
                                                        </table>
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
        </table>

    </>
}

export default React.memo(PlayerStartBench);