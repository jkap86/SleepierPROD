import React, { useState, useEffect, useRef } from "react";
const Search = React.lazy(() => import('../search'));
const PlayersOwnership = React.lazy(() => import('./playersOwnership'));


const PlayerShares = ({ player_shares, allplayers, user_id, sendRankEdit }) => {
    const [playershares, setPlayershares] = useState([])
    const [searched, setSearched] = useState('')
    const [leaguesVisible, setLeaguesVisible] = useState('')
    const [page, setPage] = useState(1)
    const [filterTeam, setFilterTeam] = useState('All')
    const [filterPosition, setFilterPosition] = useState('W/R/T/Q')
    const rowRef = useRef(null)
    const sortedByRef = useRef({
        by: 'default',
        descending: true
    })


    const sortPlayers = (sort_by, player_shares, initial = false) => {
        let l = player_shares ? player_shares : playershares
        let sb = sortedByRef.current
        let d = initial ? sb.descending :
            sb.by === sort_by ? !sb.descending : true

        switch (sort_by) {
            case 'Record':
                if (sb.descending) {
                    l = l.sort((a, b) =>
                        (b.userRoster.settings.wins / (b.userRoster.settings.wins + b.userRoster.settings.losses + b.userRoster.settings.ties)) -
                        (a.userRoster.settings.wins / (a.userRoster.settings.wins + a.userRoster.settings.losses + a.userRoster.settings.ties))
                    )
                } else {
                    l = l.sort((a, b) =>
                        (a.userRoster.settings.wins / (a.userRoster.settings.wins + a.userRoster.settings.losses + a.userRoster.settings.ties)) -
                        (b.userRoster.settings.wins / (b.userRoster.settings.wins + b.userRoster.settings.losses + b.userRoster.settings.ties))
                    )
                }
                break;
            default:
                l = l.sort((a, b) => b.leagues_owned.length - a.leagues_owned.length)
                break;
        }
        sortedByRef.current = {
            by: sort_by,
            descending: d
        }
        setPlayershares([...l])
    }

    useEffect(() => {
        sortPlayers(sortedByRef.current.by, player_shares, true)
    }, [player_shares, allplayers])

    useEffect(() => {
        setPage(1)
    }, [searched, player_shares, filterTeam])

    useEffect(() => {
        window.scrollTo({
            top: rowRef.current?.offsetTop,
            left: 0,
            behavior: 'auto'
        })
    }, [page])

    let playershares_display = playershares
    playershares_display = playershares_display.filter(x =>
        (filterTeam === 'All' || allplayers[x.id]?.team === filterTeam) &&
        (filterPosition === allplayers[x.id]?.position || filterPosition.split('/').includes(allplayers[x.id]?.position?.slice(0, 1))) &&
        ((searched?.trim()?.length || 0) === 0 || allplayers[x.id]?.full_name === searched)
    )

    const display =
        <PlayersOwnership
            playershares_display={playershares_display}
            page={page}
            setPage={setPage}
            leaguesVisible={leaguesVisible}
            setLeaguesVisible={setLeaguesVisible}
            rowRef={rowRef}
            user_id={user_id}
            allplayers={allplayers}
        />

    const nfl_teams = [
        'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
        'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA', 'MIN',
        'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB', 'TEN', 'WAS'
    ]

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
                {Array.from(Array(Math.ceil(playershares_display.length / 25)).keys()).map(key => key + 1).map(page_number =>
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
                Ownership
            </button>
        </div>
        <React.Suspense fallback={<>...</>}>
            {display}
        </React.Suspense>
    </>
}

export default React.memo(PlayerShares);