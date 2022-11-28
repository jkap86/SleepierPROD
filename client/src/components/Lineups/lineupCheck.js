import React, { useState, useEffect, useRef } from 'react';
import { avatar } from "../misc_functions";
import { getLineupCheck } from './lineupFunctions';
import taxi from '../../images/taxi.png';
import locked from '../../images/locked.png';
const Search = React.lazy(() => import('../search'));
const LineupBreakdown = React.lazy(() => import('./lineupBreakdown'));
const TableMain = React.lazy(() => import('../tableMain'));

const LineupCheck = ({ propLeagues, propAllplayers, includeTaxi, setIncludeTaxi, includeLocked, setIncludeLocked, rankMargin, setRankMargin, syncLeague, propUser, tab, setTab }) => {
    const [searched, setSearched] = useState('')
    const [page, setPage] = useState(1)
    const [leagues, setLeagues] = useState([])
    const [syncing, setSyncing] = useState(false)
    const [activeSlot, setActiveSlot] = useState(null)
    const [rostersVisible, setRostersVisible] = useState('')
    const rowRef = useRef(null)
    const [showOptions, setShowOptions] = useState(false)
    const tabRef = useRef(null)


    useEffect(() => {
        const sl = propLeagues.map(l => {
            const league_check = getLineupCheck(l.roster_positions, l.userRoster, propAllplayers, parseInt(includeTaxi), parseInt(rankMargin), parseInt(includeLocked))

            const empty_slots = l.userRoster.starters?.filter(s => s === '0').length
            const bye_slots = league_check.filter(slot => slot.cur_rank === 1000).map(slot => slot.cur_id).length
            const so_slots = league_check.filter(slot => !slot.isInOptimal).length
            const early_slots = league_check.filter(slot => slot.isInOptimalOrdered === 'E').length
            const late_slots = league_check.filter(slot => slot.isInOptimalOrdered === 'L').length

            return {
                ...l,
                empty_slots: empty_slots,
                bye_slots: bye_slots,
                so_slots: so_slots,
                qb_in_sf: league_check
                    .filter(slot => slot.slot === 'SUPER_FLEX' && propAllplayers[slot.cur_id]?.position !== 'QB').length,
                lineup_check: league_check,
                early_slots: early_slots,
                late_slots: late_slots
            }

        })
        setLeagues([...sl])

    }, [propLeagues, includeTaxi, includeLocked, rankMargin, propAllplayers])

    useEffect(() => {
        setPage(1)
    }, [searched])

    useEffect(() => {
        if (rostersVisible !== '' && activeSlot) {
            const active_league = leagues.find(x => x.league_id === rostersVisible)
            const active_slot = active_league?.lineup_check.find(slot => slot.cur_id === activeSlot.cur_id)
            setActiveSlot({ ...active_slot })
        }
    }, [leagues])

    useEffect(() => {
        setActiveSlot(null)
    }, [rostersVisible])

    const handleSyncLeague = (league_id, user_id) => {
        setSyncing(true)
        syncLeague(league_id, user_id)
        setTimeout(() => {
            setSyncing(false)
        }, 5000)
    }

    const leagues_display = searched.trim().length === 0 ? leagues :
        leagues.filter(x => x.name.trim() === searched.trim())


    const headers = [
        {
            type: 'double',
            columns: [
                ['', 2],
                ['# Slots', 4]
            ]
        },
        {
            type: 'double',
            columns: [
                ['League', 2, 'clickable'],
                ['Suboptimal', 1, 'small clickable'],
                ['Early in Flex', 1, 'small clickable'],
                ['Late not in Flex', 1, 'small clickable'],
                ['Non QBs in SF', 1, 'small clickable']
            ]
        }
    ]



    const display = (
        <>
            {
                page > 1 ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState - 1)}
                        >
                            <td colSpan={6}>PREV PAGE</td>
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
                                <td colSpan={6} >
                                    <table className={`table${1}`}>
                                        <tbody>
                                            <tr
                                                ref={index === 0 ? rowRef : null}
                                                className={rostersVisible === league.league_id ? 'main_row active clickable' : 'main_row clickable'}
                                                onClick={() => setRostersVisible(prevState => prevState === league.league_id ? '' : league.league_id)}
                                            >
                                                <td colSpan={2} className={'left'}>
                                                    <p>
                                                        {
                                                            avatar(league.avatar, league.name, 'league')
                                                        }
                                                        {league.name}
                                                    </p>
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        league.so_slots > 0 ?
                                                            <p className='red'>{league.so_slots}</p>
                                                            :
                                                            <i className={'fa fa-check green'}></i>

                                                    }
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        league.early_slots > 0 ?
                                                            <p className='red'>{league.early_slots}</p>
                                                            :
                                                            <i className={'fa fa-check green'}></i>
                                                    }
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        league.late_slots > 0 ?
                                                            <p className='red'>{league.late_slots}</p>
                                                            :
                                                            <i className={'fa fa-check green'}></i>
                                                    }
                                                </td>
                                                <td colSpan={1}>
                                                    {
                                                        league.qb_in_sf > 0 ?
                                                            <p className='red'>{league.qb_in_sf}</p>
                                                            :
                                                            <i className={'fa fa-check green'}></i>
                                                    }
                                                </td>
                                            </tr>
                                            {
                                                rostersVisible !== league.league_id ? null :
                                                    <tr>
                                                        <td colSpan={6}>
                                                            <div className={`nav2`}>
                                                                <div>
                                                                    <p className='red small'>Suboptimal</p>
                                                                    <br />
                                                                    <p className='non_qb small'>Non QB in SF</p>
                                                                </div>
                                                                <div>
                                                                    <p className='TNF small'>Early in Flex</p>
                                                                    <br />
                                                                    <p className='MNF small'>Late not in Flex</p>
                                                                </div>
                                                                <button
                                                                    className={'clickable'}
                                                                    onClick={() => handleSyncLeague(league.league_id, propUser.user_id)}
                                                                    style={{ visibility: `${syncing ? 'hidden' : ''}` }}
                                                                >
                                                                    Sync League
                                                                </button>
                                                            </div>
                                                            <React.Suspense fallback={
                                                                <div className='logo_wrapper'>
                                                                    <div className='z one'>Z</div>
                                                                    <div className='z two'>Z</div>
                                                                    <div className='z three'>Z</div>
                                                                </div>}>
                                                                <LineupBreakdown
                                                                    type={2}
                                                                    roster={league.userRoster}
                                                                    lineup_check={league.lineup_check}
                                                                    avatar={avatar}
                                                                    allplayers={propAllplayers}
                                                                    activeSlot={activeSlot}
                                                                    setActiveSlot={(slot) => setActiveSlot(slot)}
                                                                    includeTaxi={includeTaxi}
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
                (((page - 1) * 25) + 25) < propLeagues.length ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState + 1)}
                        >
                            <td colSpan={6}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </>
    )

    return <div
        onClick={(e) => !tabRef.current.contains(e.target) ? setShowOptions(false) : null}
    >
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
        <div className='nav1'>
            <div className={'nav1_button_wrapper'}>
                <button
                    className={tab === 'Weekly Rankings' ? 'active clickable' : 'clickable'}
                    onClick={() => setTab('Weekly Rankings')}
                >
                    Weekly Rankings
                </button>
                <button
                    className={tab === 'Lineup Check' ? 'active clickable' : 'clickable'}
                    onClick={() => setTab('Lineup Check')}
                >
                    Lineup Check
                </button>
                <div
                    className={'options_container'}
                    ref={tabRef}
                >
                    <button
                        className={'options click'}
                        onMouseDown={() => setShowOptions(prevState => !prevState)}
                    >
                        Options &or;
                    </button>
                    <div
                        className='options'
                        hidden={!showOptions}

                    >
                        <div className={'lineupcheck_option click'}>
                            <img
                                className={'taxi'}
                                src={locked}
                            />
                            <i
                                onClick={() => setIncludeLocked(prevState => prevState === 1 ? -1 : 1)}
                                className={`fa fa-ban clickable ${includeLocked > 0 ? 'hidden' : null}`}>

                            </i>
                        </div>
                        <div className={'lineupcheck_option click'}>
                            <img
                                className={'taxi'}
                                src={taxi}
                            />
                            <i
                                onClick={() => setIncludeTaxi(prevState => prevState === 1 ? -1 : 1)}
                                className={`fa fa-ban clickable ${includeTaxi > 0 ? 'hidden' : null}`}>

                            </i>
                        </div>
                        <div className={'lineupcheck_option click'}>
                            <label>
                                Rank Margin
                                <select
                                    className={'click'}
                                    value={rankMargin}
                                    onChange={(e) => setRankMargin(e.target.value)}
                                >
                                    {Array.from(Array(50).keys()).map(key =>
                                        <option key={key + 1}>{key + 1}</option>
                                    )}
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <TableMain
            headers={headers}
            body={display}
            page={page}
            setPage={setPage}
        />
    </div>
}
export default LineupCheck;