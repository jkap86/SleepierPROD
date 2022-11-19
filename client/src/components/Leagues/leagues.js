import React, { useState, useEffect, useRef } from "react";
const Search = React.lazy(() => import('../search'));
const LeaguesStandings = React.lazy(() => import('./leaguesStandings'));


const Leagues = ({ prop_leagues, allplayers, user_id }) => {
    const [leagues, setLeagues] = useState([])
    const [searched, setSearched] = useState('')
    const [page, setPage] = useState(1)
    const [rostersVisible, setRostersVisible] = useState('')
    const [tab, setTab] = useState('League Summary');
    const rowRef = useRef(null)
    const sortedByRef = useRef({
        by: 'default',
        descending: true
    })


    useEffect(() => {
        setPage(1)
    }, [searched, prop_leagues])

    const sortLeagues = (sort_by, prop_leagues, initial = false) => {
        let l = prop_leagues ? prop_leagues : leagues
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
            case 'PF':
                if (sb.descending) {
                    l = l.sort((a, b) =>
                        b.userRoster.settings.fpts - a.userRoster.settings.fpts ||
                        b.userRoster.settings.fpts_decimal - a.userRoster.settings.fpts_decimal
                    )
                } else {
                    l = l.sort((a, b) =>
                        a.userRoster.settings.fpts - b.userRoster.settings.fpts ||
                        a.userRoster.settings.fpts_decimal - b.userRoster.settings.fpts_decimal
                    )
                }
                break;
            case 'Rank (Ovr)':
                if (sb.descending) {
                    l = l.sort((a, b) => a.userRoster.rank - b.userRoster.rank)
                } else {
                    l = l.sort((a, b) => b.userRoster.rank - a.userRoster.rank)
                }
                break;
            case 'Rank (PF)':
                if (sb.descending) {
                    l = l.sort((a, b) => a.userRoster.rank_points - b.userRoster.rank_points)
                } else {
                    l = l.sort((a, b) => b.userRoster.rank_points - a.userRoster.rank_points)
                }
                break;
            case 'League':
                if (sb.descending) {
                    l = l.sort((a, b) => a.index - b.index)
                } else {
                    l = l.sort((a, b) => a.name > b.name ? 1 : -1)
                }
                break;
            case 'SO Slots':
                if (sb.descending) {
                    l = l.sort((a, b) => a.so_slots - b.so_slots)
                } else {
                    l = l.sort((a, b) => b.so_slots - a.so_slots)
                }
                break;
            case 'Empty Slots':
                if (sb.descending) {
                    l = l.sort((a, b) => a.empty_slots - b.empty_slots)
                } else {
                    l = l.sort((a, b) => b.empty_slots - a.empty_slots)
                }
                break;
            default:
                break;
        }
        sortedByRef.current = {
            by: sort_by,
            descending: d
        }
        setLeagues([...l])
    }

    useEffect(() => {
        window.scrollTo({
            top: rowRef.current?.offsetTop,
            left: 0,
            behavior: 'auto'
        })
    }, [page])

    useEffect(() => {
        let pl = prop_leagues
        sortLeagues(sortedByRef.current.by, pl, true)
    }, [prop_leagues])

    const leagues_display = searched.trim().length === 0 ? leagues :
        leagues.filter(x => x.name.trim() === searched.trim())


    const display = (
        <LeaguesStandings
            leagues_display={leagues_display}
            page={page}
            setPage={setPage}
            rowRef={rowRef}
            rostersVisible={rostersVisible}
            setRostersVisible={setRostersVisible}
            user_id={user_id}
            allplayers={allplayers}
        />
    )

    return <>
        <React.Suspense fallback={<>...</>}>
            <Search
                list={leagues.map(league => league.name)}
                placeholder={'Search Leagues'}
                sendSearched={(data) => setSearched(data)}
            />
        </React.Suspense>
        <div className="page_numbers_wrapper">
            <ol className="page_numbers">
                {Array.from(Array(Math.ceil(leagues_display.length / 25)).keys()).map(key => key + 1).map(page_number =>
                    <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => setPage(page_number)}>
                        {page_number}
                    </li>
                )}
            </ol>
        </div>
        <div className={`nav1`}>
            <div className={'nav1_button_wrapper'}>
                <button
                    className={tab === 'League Summary' ? 'active clickable' : 'clickable'}
                    onClick={() => setTab('League Summary')}
                >
                    Summary
                </button>
            </div>

        </div>
        {display}
    </>
}

export default Leagues;