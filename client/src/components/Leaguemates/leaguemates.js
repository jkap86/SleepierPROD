import React, { useState, useEffect, useRef } from "react";
import { avatar } from '../misc_functions';
const LeaguemateLeagues = React.lazy(() => import('./leaguemateLeagues'));
const Search = React.lazy(() => import('../search'));

const Leaguemates = (props) => {
    const [leaguemates, setLeaguemates] = useState([])
    const [searched, setSearched] = useState('')
    const [page, setPage] = useState(1)
    const [leaguesVisible, setLeaguesVisible] = useState('')
    const rowRef = useRef(null)

    const toggleLeagues = (leaguemate_id) => {
        let lv = leaguesVisible;
        if (lv.includes(leaguemate_id)) {
            lv = lv.filter(x => x !== leaguemate_id)
            console.log(lv)
        } else {
            lv.push(leaguemate_id)
        }
        setLeaguesVisible([...lv])
    }

    useEffect(() => {
        setLeaguemates(props.leaguemates.sort((a, b) => b.leagues.length - a.leagues.length))
    }, [props])

    useEffect(() => {
        setPage(1)
    }, [searched, props.leaguemates])

    useEffect(() => {
        window.scrollTo({
            top: rowRef.current?.offsetTop,
            left: 0,
            behavior: 'auto'
        })
    }, [page])

    const header = (
        <>
            <tr className="main_header double">
                <th colSpan={4} rowSpan={2} >Leaguemate</th>
                <th colSpan={2} rowSpan={2}>Leagues</th>
                <th colSpan={6}>Leaguemate</th>
                <th colSpan={6}>{props.username}</th>
            </tr>
            <tr className="main_header double">
                <th colSpan={3}>Record</th>
                <th colSpan={3}>WinPCT</th>
                <th colSpan={3}>Record</th>
                <th colSpan={3}>WinPCT</th>
            </tr>
        </>
    )

    const leaguemates_display = searched.trim().length === 0 ? leaguemates.filter(x => x.user_id !== props.user_id) :
        leaguemates.filter(x => x.display_name.trim() === searched.trim())

    const display = (
        <>
            {
                page > 1 ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState - 1)}
                        >
                            <td colSpan={18}>PREV PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
            {
                leaguemates_display.slice((page - 1) * 50, ((page - 1) * 50) + 50).map((leaguemate, index) =>
                    <tbody
                        key={`${leaguemate.user_id}_${index}`}
                    >
                        <tr>
                            <td colSpan={18}>
                                <table className={`table${1}`}>
                                    <tbody>
                                        <tr
                                            ref={index === 0 ? rowRef : null}
                                            className={leaguesVisible === leaguemate.user_id ? 'main_row active clickable' : 'main_row clickable'}
                                            onClick={() => setLeaguesVisible(prevState => prevState === leaguemate.user_id ? '' : leaguemate.user_id)}
                                        >
                                            <td colSpan={4} className={'left'}>
                                                <p>
                                                    {
                                                        avatar(leaguemate.avatar, leaguemate.display_name, 'user')
                                                    }
                                                    {leaguemate.display_name}
                                                </p>
                                            </td>
                                            <td colSpan={2}>
                                                {
                                                    leaguemate.leagues.length
                                                }
                                            </td>
                                            <td colSpan={3}>
                                                {
                                                    leaguemate.leagues.reduce((acc, cur) => acc + cur.lmroster?.settings.wins, 0)
                                                }
                                                -
                                                {
                                                    leaguemate.leagues.reduce((acc, cur) => acc + cur.lmroster?.settings.losses, 0)
                                                }
                                            </td>
                                            <td colSpan={3}>
                                                <em>
                                                    {
                                                        (leaguemate.leagues.reduce((acc, cur) => acc + cur.lmroster?.settings.wins, 0) /
                                                            leaguemate.leagues.reduce((acc, cur) => acc + cur.lmroster?.settings.wins + cur.lmroster?.settings.losses, 0)).toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 4 })
                                                    }
                                                </em>
                                            </td>
                                            <td colSpan={3}>
                                                {
                                                    leaguemate.leagues.reduce((acc, cur) => acc + cur.roster.settings.wins, 0)
                                                }
                                                -
                                                {
                                                    leaguemate.leagues.reduce((acc, cur) => acc + cur.roster.settings.losses, 0)
                                                }
                                            </td>
                                            <td colSpan={3}>
                                                <em>
                                                    {
                                                        (leaguemate.leagues.reduce((acc, cur) => acc + cur.roster.settings.wins, 0) /
                                                            leaguemate.leagues.reduce((acc, cur) => acc + cur.roster.settings.wins + cur.roster.settings.losses, 0)).toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 4 })
                                                    }
                                                </em>
                                            </td>
                                        </tr>
                                        {
                                            leaguesVisible !== leaguemate.user_id ? null :
                                                <tr>
                                                    <td colSpan={18}>
                                                        <React.Suspense fallback={
                                                            <div className='logo_wrapper'>
                                                                <div className='z one'>Z</div>
                                                                <div className='z two'>Z</div>
                                                                <div className='z three'>Z</div>
                                                            </div>
                                                        }>
                                                            <LeaguemateLeagues
                                                                type={2}
                                                                leagues={leaguemate.leagues}
                                                                leaguemate={leaguemate.display_name}
                                                                username={props.username}
                                                                avatar={avatar}
                                                                user_id={props.user_id}
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
                (((page - 1) * 25) + 25) < leaguemates_display.length ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState + 1)}
                        >
                            <td colSpan={18}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </>
    )
    return <>
        <React.Suspense fallback={<>...</>}>
            <Search
                list={leaguemates.map(leaguemate => leaguemate.display_name)}
                placeholder={'Search Leaguemates'}
                sendSearched={(data) => setSearched(data)}
            />
        </React.Suspense>
        <div className="page_numbers_wrapper">
            <ol className="page_numbers">
                {Array.from(Array(Math.ceil(leaguemates_display.length / 50)).keys()).map(key => key + 1).map(page_number =>
                    <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => setPage(page_number)}>
                        {page_number}
                    </li>
                )}
            </ol>
        </div>
        <div className={`nav1`}></div>
        <table className="main">
            <thead className="main">
                {header}
            </thead>
            {display}
        </table>
    </>
}

export default React.memo(Leaguemates);