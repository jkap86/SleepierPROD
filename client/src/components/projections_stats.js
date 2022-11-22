export const getNewRank = (rankings, prevRank, newRank, player_id, playerToIncrement, playerToIncrementRank) => {
    let incrementedRank = playerToIncrementRank
    if (playerToIncrement === player_id) {
        incrementedRank = newRank
    } else {
        if (rankings[playerToIncrement].rank_ecr > prevRank && rankings[playerToIncrement].rank_ecr < 999) {
            incrementedRank = parseInt(rankings[playerToIncrement].rank_ecr) - 1
        }
        if (incrementedRank >= newRank && rankings[playerToIncrement].rank_ecr < 999) {
            incrementedRank = parseInt(incrementedRank) + 1
        }
    }
    return incrementedRank
}

export const getLineupCheck = (roster_positions, roster, allplayers, includeTaxi, rankMargin, includeLocked) => {

    const now = new Date()
    const now_offset = new Date((new Date() - new Date().getTimezoneOffset()))
    const now_slot_day = now_offset.getDay() < 4 ? now_offset.getDay() + 7 : now_offset.getDay()
    const now_slot_hour = now_offset.getHours()
    const now_slot = parseFloat(now_slot_day + "." + now_slot_hour.toLocaleString("en-US", { minimumIntegerDigits: 2 }))

    const position_map = {
        'QB': ['QB'],
        'RB': ['RB', 'FB'],
        'WR': ['WR'],
        'TE': ['TE'],
        'FLEX': ['RB', 'FB', 'WR', 'TE'],
        'SUPER_FLEX': ['QB', 'RB', 'FB', 'WR', 'TE'],
        'WRRB_FLEX': ['RB', 'FB', 'WR'],
        'REC_FLEX': ['WR', 'TE']
    }
    const starting_slots = roster_positions.filter(x => Object.keys(position_map).includes(x))


    let player_ranks = roster.players?.filter(x =>
        (includeTaxi > 0 || !roster.taxi?.includes(x))
    ).map(player => {
        let rank = allplayers[player]?.rank_ecr
        if (!roster.starters?.includes(player)) {
            rank = (rank + rankMargin)

        } else {
            rank = allplayers[player]?.rank_ecr
        }
        if (includeLocked < 0 && new Date(allplayers[player]?.gametime) < now) {
            if (roster.starters.includes(player)) {
                rank = 0
            } else {
                rank = 1000
            }
        }

        return {
            id: player,
            rank: parseInt(rank)
        }
    })

    let optimal_lineup = []
    let player_ranks_filtered = player_ranks
    starting_slots.map((slot, index) => {
        const slot_options = player_ranks_filtered
            .filter(p => position_map[slot].includes(allplayers[p.id]?.position))
            .sort((a, b) => a.rank - b.rank || roster.starters.includes(a.id) - roster.starters.includes(b.id))

        const optimal_player = slot_options[0]?.rank < 999 ? slot_options[0]?.id :
            roster.starters[index]
        player_ranks_filtered = player_ranks_filtered.filter(p => p.id !== optimal_player)
        optimal_lineup[index] = optimal_player
    })

    let lineup_check = []

    starting_slots.map((slot, index) => {
        const cur_id = roster.starters[index]
        const isInOptimal = optimal_lineup.includes(cur_id)

        const optimal_options = optimal_lineup.filter(op =>
            !roster.starters.includes(op) &&
            position_map[slot].includes(allplayers[op]?.position) &&
            player_ranks.find(pr => pr.id === op)?.rank < player_ranks.find(pr => pr.id === cur_id)?.rank
        )

        const slot_abbrev = slot
            .replace('SUPER_FLEX', 'SF')
            .replace('FLEX', 'W/R/T')
            .replace('WRRB_FLEX', 'W/R')
            .replace('REC_FLEX', 'W/T')

        const gametime_offset = new Date((new Date(allplayers[cur_id]?.gametime) - new Date(allplayers[cur_id]?.gametime).getTimezoneOffset()))
        const day = gametime_offset.getDay()
        const game_slot_day = day < 4 ? day + 7 : day
        const game_slot_hour = gametime_offset.getHours()
        const game_slot = parseFloat(game_slot_day + "." + game_slot_hour.toLocaleString("en-US", { minimumIntegerDigits: 2 }))

        lineup_check.push({
            index: index,
            slot: slot,
            slot_abbrev: slot_abbrev,
            cur_id: cur_id,
            cur_rank: allplayers[cur_id]?.rank_ecr,
            gametime: allplayers[cur_id]?.gametime,
            optimal_options: optimal_options,
            isInOptimal: isInOptimal,
            game_slot: game_slot
        })
    })

    lineup_check = lineup_check.map((lc) => {
        let swaps;
        let isInOptimal = lc.isInOptimal
        if (!isInOptimal && lc.optimal_options.length === 0) {
            const subs_all = Array.from(new Set(lineup_check.map(x => x.optimal_options).flat()))
            const sub_in = optimal_lineup.filter(op => !roster.starters.includes(op) && !subs_all.includes(op))
            if (sub_in.length === 0) {
                isInOptimal = true
            } else {
                const swap_out = lineup_check
                    .filter(x =>
                        x.isInOptimal && x.optimal_options.length > 0 &&
                        position_map[x.slot].includes(allplayers[lc.cur_id]?.position) &&
                        position_map[lc.slot].includes(allplayers[x.cur_id]?.position)
                    )
                    .sort((a, b) => a.cur_rank - b.cur_rank)

                swaps = swap_out[0]
            }
        }

        let isInOptimalOrdered;
        let tv_slot = '***'
        if (lc.game_slot < 7.12 && lc.isInOptimal) {
            const isInFlex = lc.slot !== allplayers[lc.cur_id]?.position
            const samePos = lineup_check.filter(x =>
                allplayers[x.cur_id]?.position === allplayers[lc.cur_id]?.position &&
                allplayers[x.cur_id]?.position === x.slot &&
                x.game_slot > lc.game_slot && x.game_slot - lc.game_slot > 0.05 &&
                !(includeLocked < 0 && (lc.game_slot < now_slot || x.game_slot < now_slot))
            )

            isInOptimalOrdered = (isInFlex && samePos.length > 0) ? 'E' : null
            if (Math.floor(lc.game_slot) === 4) {
                tv_slot = 'TNF'
            }
        } else if (lc.isInOptimal && lc.game_slot > 7.16) {
            const isInFlex = lc.slot !== allplayers[lc.cur_id]?.position
            const samePos = lineup_check.filter(x =>
                allplayers[x.cur_id]?.position === allplayers[lc.cur_id]?.position &&
                allplayers[x.cur_id]?.position !== x.slot &&
                x.game_slot < lc.game_slot && lc.game_slot - x.game_slot > 0.05 &&
                !(includeLocked < 0 && (lc.game_slot < now_slot || x.game_slot < now_slot))
            )

            if (Math.floor(lc.game_slot) === 7) {
                tv_slot = 'SNF'
            } else if (Math.floor(lc.game_slot) === 8) {
                tv_slot = 'MNF'
            }
            isInOptimalOrdered = (!isInFlex && samePos.length > 0) ? 'L' : null
        }

        return {
            ...lc,
            optimal_options: lc.isInOptimal ? [] : lc.optimal_options,
            isInOptimalOrdered: isInOptimalOrdered,
            swaps: swaps,
            tv_slot: tv_slot
        }
    })

    return lineup_check
}

export const getStartedOver = (player_id, roster, roster_positions, allplayers, player_rank) => {
    const position_map = {
        'QB': ['QB'],
        'RB': ['RB', 'FB'],
        'WR': ['WR'],
        'TE': ['TE'],
        'FLEX': ['RB', 'FB', 'WR', 'TE'],
        'SUPER_FLEX': ['QB', 'RB', 'FB', 'WR', 'TE'],
        'WRRB_FLEX': ['RB', 'FB', 'WR'],
        'REC_FLEX': ['WR', 'TE']
    }

    const slot = roster_positions[roster.starters.indexOf(player_id)]

    const subs = roster.players.filter(p =>
        !roster.starters.includes(p) &&
        position_map[slot].includes(allplayers[p].position) &&
        allplayers[p]?.rank_ecr < player_rank
    )

    return subs.length > 0 ? subs : null
}

export const getBenchedOver = (player_id, roster, roster_positions, allplayers, player_rank) => {
    const position_map = {
        'QB': ['QB'],
        'RB': ['RB', 'FB'],
        'WR': ['WR'],
        'TE': ['TE'],
        'FLEX': ['RB', 'FB', 'WR', 'TE'],
        'SUPER_FLEX': ['QB', 'RB', 'FB', 'WR', 'TE'],
        'WRRB_FLEX': ['RB', 'FB', 'WR'],
        'REC_FLEX': ['WR', 'TE']
    }

    const slots = roster_positions.map((slot, index) => {
        const rank = allplayers[roster.starters[index]]
        const rank_ovr = rank?.rank_ecr
        const rank_pos = rank?.pos_rank
        return {
            slot: slot.replace('SUPER_FLEX', 'SF').replace('FLEX', 'WRT'),
            starter: roster.starters[index],
            rank: rank_ovr,
            rank_pos: rank_pos
        }
    }).filter((slot, index) => {
        return (
            position_map[slot.slot]?.includes(allplayers[player_id]?.position) &&
            slot.rank > player_rank
        )
    })

    return slots.length > 0 ? slots : null

}