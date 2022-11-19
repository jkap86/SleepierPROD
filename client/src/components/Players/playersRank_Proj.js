

import React, { useState, useEffect, useRef } from "react";
import { avatar } from "../misc_functions";
import { getNewRank } from "../projections_stats";
import { writeFile, utils, read } from 'xlsx';
import fantasypros_icon from '../../images/FantasyPros.jpeg'
const Search = React.lazy(() => import('../search'));

const PlayersRankProj = ({ playershares, allplayers, sendRankEdit }) => {
    const [edit, setEdit] = useState(false)
    const [rankings, setRankings] = useState({})
    const [page, setPage] = useState(1)
    const rowRef = useRef(null)
    const [filterTeam, setFilterTeam] = useState('All')
    const [filterPosition, setFilterPosition] = useState('W/R/T/Q')
    const [searched, setSearched] = useState('')

    useEffect(() => {
        setRankings(allplayers)
    }, [allplayers])

    const handleRankChange = (e, player_id) => {
        let r = rankings
        const prevRank = rankings[player_id].rank_ecr
        const newRank = parseInt(e.target.value) || ' '

        if ((newRank >= 0 && newRank <= 1000) || e.target.value.trim() === '') {
            Object.keys(rankings)
                .map((player, index) => {
                    rankings[player].original_rank = rankings[player].original_rank || rankings[player].rank_ecr
                    let incrementedRank = rankings[player].rank_ecr
                    incrementedRank = getNewRank(rankings, prevRank, newRank, player_id, player, incrementedRank)
                    rankings[player].rank_ecr = incrementedRank
                })
            setRankings({ ...r })
        }
    }

    const handleRankSave = () => {
        const r = rankings
        sendRankEdit(r)
        setEdit(false)
    }

    const exportRankings = () => {
        const data = Object.keys(allplayers)
            .filter(id => playershares.find(ps => ps.id === id))
            .map(id => {
                return {
                    id: id,
                    fantasypros: allplayers[id].original_rank || allplayers[id].rank_ecr,
                    rank: allplayers[id].rank_ecr,
                    player: allplayers[id].full_name,
                    position: allplayers[id].position,
                    team: allplayers[id].team || 'FA',
                    opponent: allplayers[id]?.player_opponent
                }
            })
            .sort((a, b) => a.rank - b.rank)
        const worksheet = utils.json_to_sheet(data)
        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, "Rankings")
        writeFile(workbook, "SleepierRankings.csv")
    }

    const importRankings = (e) => {
        if (e.target.files) {
            const reader = new FileReader()
            reader.onload = (e) => {
                let r = allplayers
                const data = e.target.result
                const workbook = read(data, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                let json = utils.sheet_to_json(worksheet)
                json.map(player =>
                    r[player.id] = {
                        ...r[player.id],
                        original_rank: r[player.id].rank_ecr,
                        rank_ecr: player.rank,
                        past_rank: player.fantasypros
                    }
                )
                console.log(r)
                setRankings({ ...r })
                setEdit(true)
            }
            reader.readAsArrayBuffer(e.target.files[0])
        }
    }

    const nfl_teams = [
        'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
        'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA', 'MIN',
        'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS'
    ]



    const header = (
        <>
            <tr className="main_header single">
                <th colSpan={3}
                >
                    <i
                        onClick={() => exportRankings()}
                        className={'fa fa-download clickable left'}
                    >
                    </i>
                    Player
                    <i
                        className={'fa fa-upload clickable right'}
                    >
                        <input type={'file'} className={'hidden clickable'} onChange={(e) => importRankings(e)} />
                    </i>
                </th>
                <th colSpan={2}>
                    {
                        edit ?
                            <>
                                <i
                                    onClick={() => setEdit(false)}
                                    className={'fa fa-trash clickable left'}
                                >
                                </i>
                            </>
                            : null
                    }
                    OVR
                    {
                        edit ?
                            <>
                                <i
                                    onClick={() => handleRankSave()}
                                    className={'fa fa-save clickable right'}
                                >
                                </i>
                            </>
                            :
                            <i
                                onClick={() => setEdit(true)}
                                className={'fa fa-edit clickable right'}
                            >
                            </i>
                    }
                </th>
                <th colSpan={1}>Pos</th>
                <th colSpan={1}>Min</th>
                <th colSpan={1}>Max</th>
                <th colSpan={2}>Opp</th>
            </tr>
            {
                edit ?
                    <tr className="main_header double">
                        <th colSpan={3}></th>
                        <th className="small">
                            <img
                                className="thumbnail small"
                                src={fantasypros_icon}
                            />
                        </th>
                        <th className="small">Custom</th>
                        <th colSpan={5}></th>
                    </tr>
                    : null

            }
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
                            <td colSpan={10}>PREV PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
            {
                playershares
                    .filter(x =>
                        (filterTeam === 'All' || allplayers[x.id]?.team === filterTeam) &&
                        (filterPosition === allplayers[x.id]?.position || filterPosition.split('/').includes(allplayers[x.id]?.position?.slice(0, 1))) &&
                        ((searched?.trim()?.length || 0) === 0 || allplayers[x.id]?.full_name === searched)
                    )
                    .slice((page - 1) * 25, ((page - 1) * 25) + 25).map((player, index) =>
                        <tbody
                            key={`${player.id}_${index}`}
                        >
                            <tr>
                                <td colSpan={10}>
                                    <table className={`table${1}`}>
                                        <tbody>
                                            <tr
                                                ref={index === 0 ? rowRef : null}
                                                className={'main_row clickable'}
                                            >
                                                <td colSpan={3} className={'left'}>
                                                    <p>
                                                        {
                                                            avatar(player.id, allplayers[player.id]?.full_name, 'player')
                                                        }
                                                        {allplayers[player.id]?.position || player.id}&nbsp;
                                                        {allplayers[player.id]?.full_name || player.player_name}&nbsp;
                                                        {allplayers[player.id]?.team}
                                                    </p>
                                                </td>
                                                <td colSpan={edit ? 1 : 2} className={'relative'}>
                                                    {
                                                        edit ?
                                                            allplayers[player.id]?.original_rank ? allplayers[player.id].original_rank :
                                                                ((allplayers[player.id]?.rank_ecr === 1000) ? 'BYE' :
                                                                    (allplayers[player.id]?.rank_ecr || 999)) :
                                                            ((allplayers[player.id]?.rank_ecr === 1000) ? 'BYE' :
                                                                (allplayers[player.id]?.rank_ecr || 999))
                                                    }
                                                </td>
                                                <td colSpan={1} hidden={!edit}>
                                                    {

                                                        edit ?
                                                            <input
                                                                className={'editRank'}
                                                                value={rankings[player.id]?.rank_ecr}
                                                                onChange={(e) => handleRankChange(e, player.id)}
                                                            />
                                                            : null

                                                    }
                                                </td>
                                                <td colSpan={1}>
                                                    {allplayers[player.id]?.position === 'FB' ? 'RB' : allplayers[player.id]?.position}
                                                    {

                                                        (Object.keys(allplayers)
                                                            .filter(ap =>
                                                                allplayers[ap].position === allplayers[player.id]?.position ||
                                                                (allplayers[player.id]?.position === 'FB' && ['FB', 'RB'].includes(allplayers[ap].position))
                                                            )
                                                            .sort((a, b) => (allplayers[a].rank_ecr || 999) - (allplayers[b].rank_ecr || 999))
                                                            .indexOf(player.id) + 1)
                                                    }
                                                </td>
                                                <td>{allplayers[player.id]?.rank_min}</td>
                                                <td>{allplayers[player.id]?.rank_max}</td>
                                                <td colSpan={2}>{allplayers[player.id]?.player_opponent || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    )
            }
            {
                (((page - 1) * 25) + 25) < playershares.length ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState + 1)}
                        >
                            <td colSpan={10}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </>
    )
    const week = rankings[Object.keys(rankings)[0]]?.week

    return <>
        <span className="team">
            <label>
                <img
                    className={'icon'}
                    src={`https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/${filterTeam}.png`}
                    onError={(e) => { return e.target.src = `https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png` }}
                />
                <select
                    className="hidden clickable"
                    onChange={(e) => setFilterTeam(e.target.value)}
                    value={filterTeam}
                >
                    <option>All</option>
                    {nfl_teams.map(team =>
                        <React.Fragment key={team}>
                            <option>{team}</option>
                        </React.Fragment>
                    )}
                </select>
            </label>

        </span>
        <React.Suspense fallback={<>...</>}>
            <Search
                list={playershares.map(player => allplayers[player.id]?.full_name)}
                placeholder={'Search Players'}
                sendSearched={(data) => setSearched(data)}
            />
        </React.Suspense>
        <span className="team">
            <label>
                <div className={`position_square${filterPosition.split('/').length}`}>
                    {filterPosition.split('/').includes('W') || filterPosition === 'WR' ? <div className="wr">{filterPosition === 'WR' ? 'WR' : 'W'}</div> : null}
                    {filterPosition.split('/').includes('R') || filterPosition === 'RB' ? <div className="rb">{filterPosition === 'RB' ? 'RB' : 'R'}</div> : null}
                    {filterPosition.split('/').includes('T') || filterPosition === 'TE' ? <div className="te">{filterPosition === 'TE' ? 'TE' : 'T'}</div> : null}
                    {filterPosition.split('/').includes('Q') || filterPosition === 'QB' ? <div className="qb">{filterPosition === 'QB' ? 'QB' : 'Q'}</div> : null}
                </div>
                <select
                    className="hidden clickable"
                    onChange={(e) => setFilterPosition(e.target.value)}
                    value={filterPosition}
                >
                    <option>QB</option>
                    <option>RB</option>
                    <option>WR</option>
                    <option>TE</option>
                    <option>W/R/T/Q</option>
                    <option>W/R/T</option>
                    <option>W/R</option>
                    <option>W/T</option>
                </select>
            </label>

        </span>
        <div className="page_numbers_wrapper">
            <ol className="page_numbers">
                {Array.from(Array(Math.ceil(playershares.length / 25)).keys()).map(key => key + 1).map(page_number =>
                    <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => setPage(page_number)}>
                        {page_number}
                    </li>
                )}
            </ol>
        </div>
        <div className={`nav1`}>
            <button
                className={'active clickable'}
            >
                {`Week ${week} Rankings`}
            </button>
        </div>
        <table className="main">
            <thead className="main">
                {header}
            </thead>
            {display}
        </table>
    </>
}
export default PlayersRankProj;