import React, { useState } from "react";
const LineupCheck = React.lazy(() => import('./lineupCheck'));

const LineupsTab = ({ propLeagues, propAllplayers, syncLeague, propUser, includeTaxi, setIncludeTaxi, rankMargin, setRankMargin, includeLocked, setIncludeLocked }) => {
    const [tab, setTab] = useState('Lineup Check');

    return <>
        <LineupCheck
            propLeagues={propLeagues}
            propAllplayers={propAllplayers}
            includeTaxi={includeTaxi}
            setIncludeTaxi={setIncludeTaxi}
            includeLocked={includeLocked}
            setIncludeLocked={setIncludeLocked}
            rankMargin={rankMargin}
            setRankMargin={setRankMargin}
            syncLeague={syncLeague}
            propUser={propUser}
            tab={tab}
            setTab={setTab}
        />
    </>
}

export default LineupsTab;