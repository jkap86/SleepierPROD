import React, { useState } from "react";

const Leagues_Available = ({ leagues_available, type, avatar, page, setPage }) => {
    const [rostersVisible, setRostersVisible] = useState([]);

    const toggleRosters = (league_id) => {
        let rv = rostersVisible;
        if (rv.includes(league_id)) {
            rv = rv.filter(x => x !== league_id)
        } else {
            rv.push(league_id)
        }
        setRostersVisible([...rv])
    }

    return <>
        <table className={`table${type}`}>
            <thead>
                <tr className={`single`}>
                    <th colSpan={1}>League</th>
                </tr>
            </thead>
            {
                page > 1 ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState - 1)}
                        >
                            <td colSpan={1}>PREV PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
            {
                leagues_available
                    ?.slice((page - 1) * 25, ((page - 1) * 25) + 25)
                    ?.map((league, index) =>
                        <tbody
                            key={`${league.league_id}_${index}`}
                        >
                            <tr
                                className={rostersVisible.includes(league.league_id) ? `row${type} active` : `row${type}`}
                            >
                                <td colSpan={1} className={'left'}>
                                    <p onClick={() => toggleRosters(league.league_id)}>
                                        {
                                            avatar(league.avatar, league.name, 'league')
                                        }
                                        {league.name}
                                    </p>
                                </td>
                            </tr>

                        </tbody>
                    )
            }
            {
                (((page - 1) * 25) + 25) < leagues_available.length ?
                    <tbody>
                        <tr
                            className={'clickable'}
                            onClick={() => setPage(prevState => prevState + 1)}
                        >
                            <td colSpan={1}>NEXT PAGE</td>
                        </tr>
                    </tbody>
                    :
                    null
            }
        </table>
    </>
}

export default Leagues_Available;