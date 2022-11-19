
const LineupBreakdown = ({ type, roster, lineup_check, avatar, allplayers, activeSlot, setActiveSlot, includeTaxi }) => {

    const display = lineup_check.map((slot, index) =>
        <tbody key={`${slot.cur_id}_${index}`}>
            <tr
                className={
                    activeSlot?.slot === slot.slot && activeSlot?.index === index ?
                        `row${type} active clickable` : `row${type} clickable`
                }
                onClick={() => setActiveSlot(prevState => prevState?.cur_id === slot.cur_id ? null : slot)}
            >
                <td colSpan={1}
                    className={
                        !slot.isInOptimal ? 'red'
                            : slot.isInOptimalOrdered === 'E' ? 'earlier'
                                : slot.isInOptimalOrdered === 'L' ? 'later'
                                    : (slot.slot_abbrev === 'SF' && allplayers[slot.cur_id]?.position !== 'QB') ? 'non_qb_sf'
                                        : null
                    }
                >
                    {slot.slot_abbrev}
                </td>
                <td colSpan={3} className={'left'}>
                    <p>
                        {
                            avatar(slot.cur_id, allplayers[slot.cur_id]?.full_name, 'player')
                        }
                        {
                            parseInt(slot.cur_id) === 0 ? 'Empty' :
                                `${allplayers[slot.cur_id]?.position} ${allplayers[slot.cur_id]?.full_name} ${allplayers[slot.cur_id]?.team || 'FA'}`
                        }
                        {
                            allplayers[slot.cur_id]?.injury ?
                                <p className={'red small'}>
                                    {allplayers[slot.cur_id]?.injury}
                                </p>
                                : null
                        }
                    </p>
                </td>
                <td className={slot.tv_slot}>
                    {slot.cur_rank === 1000 ? 'BYE' : slot.cur_rank || '-'}
                </td>
                <td>
                    {
                        !(allplayers[slot.cur_id]?.rank_ecr <= 999) ? '-' :
                            allplayers[slot.cur_id]?.position === 'FB' ? 'RB' : allplayers[slot.cur_id]?.position + "" +
                                (Object.keys(allplayers)
                                    .filter(ap =>
                                        allplayers[ap].position === allplayers[slot.cur_id]?.position ||
                                        (allplayers[slot.cur_id]?.position === 'FB' && ['FB', 'RB'].includes(allplayers[ap].position))
                                    )
                                    .sort((a, b) => (allplayers[a].rank_ecr || 999) - (allplayers[b].rank_ecr || 999))
                                    .indexOf(slot.cur_id) + 1)
                    }
                </td>
            </tr>
        </tbody >
    )
    const optimal_options = (
        !activeSlot ? roster.players.filter(p => !roster.starters?.includes(p) && (includeTaxi > 0 || !roster.taxi?.includes(p))) :
            activeSlot ? activeSlot.optimal_options : null
    )

    const swap = activeSlot?.swaps


    return <>
        <table className={`table${type} lineup`}>
            <thead>
                <tr className={'single'}>
                    <th colSpan={1}>Slot</th>
                    <th colSpan={3}>Starter</th>
                    <th colSpan={1}>Rank</th>
                    <th colSpan={1}>Pos Rank</th>
                </tr>
            </thead>
            {display}
        </table>

        <table className={`table${type} subs`}>
            <thead>
                <tr className={'single'}>
                    <th colSpan={1}>Slot</th>
                    <th colSpan={3}>Starter</th>
                    <th colSpan={1}>Rank</th>
                    <th colSpan={1}>Pos Rank</th>
                </tr>
            </thead>
            {
                swap ?
                    <tbody>
                        <tr className={'title'}>
                            <td colSpan={6} className={'transparent'}>Swap With</td>
                        </tr>
                        <tr className="swap">
                            <td colSpan={1}>
                                {
                                    swap.slot_abbrev
                                }
                            </td>
                            <td colSpan={3} className={'left'}>
                                <p>
                                    {
                                        avatar(swap.cur_id, allplayers[swap.cur_id]?.full_name, 'player')
                                    }
                                    {`${allplayers[swap.cur_id]?.position} ${allplayers[swap.cur_id]?.full_name} ${allplayers[swap.cur_id]?.team || 'FA'}`}
                                    {
                                        allplayers[swap.cur_id]?.injury ?
                                            <p className={'red small'}>
                                                {allplayers[swap.cur_id]?.injury}
                                            </p>
                                            : null
                                    }
                                </p>
                            </td>
                            <td colSpan={1}>
                                {allplayers[swap.cur_id]?.rank_ecr === 1000 ? 'BYE' : allplayers[swap.cur_id]?.rank_ecr || 999}
                            </td>
                            <td colSpan={1}>
                                {
                                    allplayers[swap.cur_id]?.rank_ecr >= 999 ? '-' :
                                        allplayers[swap.cur_id]?.position === 'FB' ? 'RB' : allplayers[swap.cur_id]?.position + "" +
                                            (Object.keys(allplayers)
                                                .filter(ap =>
                                                    allplayers[ap].position === allplayers[swap.cur_id]?.position ||
                                                    (allplayers[swap.cur_id]?.position === 'FB' && ['FB', 'RB'].includes(allplayers[ap].position))
                                                )
                                                .sort((a, b) => (allplayers[a].rank_ecr || 999) - (allplayers[b].rank_ecr || 999))
                                                .indexOf(swap.cur_id) + 1)
                                }
                            </td>
                        </tr>
                    </tbody>
                    : null
            }
            {
                optimal_options?.length > 0 ?
                    <tbody>
                        <tr className={'title'}>
                            <td colSpan={6} className={'transparent'}>Sub In</td>
                        </tr>
                        {
                            optimal_options
                                ?.sort((a, b) => (roster.taxi?.includes(a) - roster.taxi?.includes(b)) || (allplayers[a]?.rank_ecr || 999) -
                                    (allplayers[b]?.rank_ecr || 999))
                                ?.map((bp, index) =>
                                    <tr className={activeSlot ? 'swap' : null}>
                                        <td colSpan={1}>
                                            {
                                                roster.taxi?.includes(bp) ? 'Taxi' :
                                                    roster.reserve?.includes(bp) ? 'IR' :
                                                        lineup_check.find(x => x.cur_id === bp)?.slot_abbrev || 'BN'
                                            }
                                        </td>
                                        <td colSpan={3} className={'left'} onClick={() => console.log(allplayers[bp])}>
                                            <p>
                                                {
                                                    avatar(bp, allplayers[bp]?.full_name, 'player')
                                                }
                                                {`${allplayers[bp]?.position} ${allplayers[bp]?.full_name} ${allplayers[bp]?.team || 'FA'}`}
                                                {
                                                    allplayers[bp]?.injury ?
                                                        <p className={'red small'}>
                                                            {allplayers[bp]?.injury}
                                                        </p>
                                                        : null
                                                }
                                            </p>
                                        </td>
                                        <td colSpan={1}>
                                            {allplayers[bp]?.rank_ecr === 1000 ? 'BYE' : allplayers[bp]?.rank_ecr || 999}
                                        </td>
                                        <td colSpan={1}>
                                            {
                                                allplayers[bp]?.rank_ecr >= 999 ? '-' :
                                                    allplayers[bp]?.position === 'FB' ? 'RB' : allplayers[bp]?.position + "" +
                                                        (Object.keys(allplayers)
                                                            .filter(ap =>
                                                                allplayers[ap].position === allplayers[bp]?.position ||
                                                                (allplayers[bp]?.position === 'FB' && ['FB', 'RB'].includes(allplayers[ap].position))
                                                            )
                                                            .sort((a, b) => (allplayers[a].rank_ecr || 999) - (allplayers[b].rank_ecr || 999))
                                                            .indexOf(bp) + 1)
                                            }
                                        </td>
                                    </tr>
                                )
                        }
                    </tbody>
                    : null
            }
        </table>
    </>
}

export default LineupBreakdown;