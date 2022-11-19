import React, { useEffect, useState } from "react";
const Leagues_Owned = React.lazy(() => import('./leagues_owned'));
const Leagues_Taken = React.lazy(() => import('./leagues_taken'));
const Leagues_Available = React.lazy(() => import('./leagues_available'));

const PlayerLeagues = (props) => {
    const [leaguesAvailable, setLeaguesAvailable] = useState([])
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
        setPage(1)
    }, [tab])

    useEffect(() => {
        setLeaguesAvailable(props.leagues_available)
    }, [props.leagues_available])


    let leagues_display = tab === 'Owned' ? props.leagues_owned :
        tab === 'Taken' ? props.leagues_taken :
            tab === 'Available' ? props.leagues_available :
                []

    return <>
        <div className={`nav${props.type}`}>
            <ol className="page_numbers2">
                {Array.from(Array(Math.ceil(leagues_display.length / 25)).keys()).map(key => key + 1).map(page_number =>
                    <li className={page === page_number ? 'active clickable' : 'clickable'} key={page_number} onClick={() => setPage(page_number)}>
                        {page_number}
                    </li>
                )}
            </ol>
            <div className={'nav2_button_wrapper'}>
                <button
                    className={tab === 'Owned' ? 'active clickable' : 'clickable'}
                    onClick={() => setTab('Owned')}
                >
                    <p>
                        Owned
                    </p>
                </button>
                <button
                    className={tab === 'Taken' ? 'active clickable' : 'clickable'}
                    onClick={() => setTab('Taken')}
                >
                    <p>
                        Taken
                    </p>
                </button>
                <button
                    className={tab === 'Available' ? 'active clickable' : 'clickable'}
                    onClick={() => setTab('Available')}
                >
                    <p>
                        Available
                    </p>
                </button>
            </div>
        </div>
        {
            tab === 'Owned' ?
                <React.Suspense fallback={
                    <div className='logo_wrapper'>
                        <div className='z one'>Z</div>
                        <div className='z two'>Z</div>
                        <div className='z three'>Z</div>
                    </div>
                }>
                    <Leagues_Owned
                        leagues_owned={props.leagues_owned}
                        type={props.type}
                        avatar={props.avatar}
                        page={page}
                        setPage={setPage}
                    />
                </React.Suspense>
                : tab === 'Taken' ?
                    <React.Suspense fallback={
                        <div className='logo_wrapper'>
                            <div className='z one'>Z</div>
                            <div className='z two'>Z</div>
                            <div className='z three'>Z</div>
                        </div>
                    }>
                        <Leagues_Taken
                            leagues_taken={props.leagues_taken}
                            type={props.type}
                            avatar={props.avatar}
                            page={page}
                            setPage={setPage}
                        />
                    </React.Suspense>
                    : tab === 'Available' ?
                        <React.Suspense fallback={
                            <div className='logo_wrapper'>
                                <div className='z one'>Z</div>
                                <div className='z two'>Z</div>
                                <div className='z three'>Z</div>
                            </div>
                        }>
                            <Leagues_Available
                                leagues_available={props.leagues_available}
                                type={props.type}
                                avatar={props.avatar}
                                page={page}
                                setPage={setPage}
                            />
                        </React.Suspense>
                        : null
        }

    </>
}

export default PlayerLeagues;