import React, { useState } from "react";
const PlayersRankProj = React.lazy(() => import('./playersRank_Proj'));
const LineupCheck = React.lazy(() => import('./lineupCheck'));

const LineupsTab = ({ propLeagues, propAllplayers, syncLeague, propUser, includeTaxi, setIncludeTaxi, rankMargin, setRankMargin, includeLocked, setIncludeLocked, playershares, sendRankEdit }) => {
    const [tab, setTab] = useState('Lineup Check');

    let display;
    switch (tab) {
        case 'Weekly Rankings':
            display = <PlayersRankProj
                allplayers={propAllplayers}
                playershares={playershares}
                sendRankEdit={sendRankEdit}
                tab={tab}
                setTab={setTab}
            />
            break;
        case 'Lineup Check':
            display = <LineupCheck
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
            break;
        default:
            break;
    }

    return <>
        {display}
    </>
}

export default LineupsTab;