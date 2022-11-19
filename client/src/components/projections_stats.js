
export const match_weekly_rankings = async (weekly_rankings, allplayers, schedule) => {
    const week = weekly_rankings.find(w_r => w_r.week).week
    const teams_playing = Array.from(new Set(weekly_rankings.map(w_r => w_r.player_team_id)))
    weekly_rankings.map(fp_id => {
        const searchName = (
            fp_id.player_name
                .split(' ')
                .filter(x => !['V', 'III', 'II', 'Sr.', 'Jr.'].includes(x))
                .join('')
                .replace("'", "")
                .replace('-', '')
                .replace('.', '')
                .toLowerCase()
                .replace(/[^a-zA-Z ]/g, "")
                .trim()
        )
        const match_id = Object.keys(allplayers).find(x =>
            (
                allplayers[x].yahoo_id === parseInt(fp_id.player_yahoo_id) &&
                allplayers[x].search_full_name.replace(/[^a-zA-Z ]/g, "").trim() === searchName
            )
            ||
            (
                (
                    (allplayers[x].position === fp_id.player_position_id ||
                        ['RB', 'TE'].includes(fp_id.player_position_id) && allplayers[x].position === 'FB')
                )
                &&
                (allplayers[x].search_full_name.trim() === searchName)
                &&
                (
                    allplayers[x].team === fp_id.player_team_id ||
                    allplayers[x].team?.slice(0, 2) === fp_id.player_team_id.slice(0, 2)
                )
            )
        )

        if (match_id) {
            const gametime = schedule.find(s =>
                s.Week === parseInt(fp_id.week) &&
                ([s.AwayTeam, s.HomeTeam].includes(fp_id.player_team_id.replace('JAC', 'JAX')) && ![s.AwayTeam, s.HomeTeam].includes('BYE'))
            )?.Date

            let gametime_date;
            let day;
            let hour;
            let time;
            if (gametime) {
                gametime_date = new Date(gametime)
                day = gametime_date.getDay()
                hour = gametime_date.getHours()
                time = gametime_date.getTime()
            }

            allplayers[match_id] = {
                ...allplayers[match_id],
                ...fp_id,
                gametime: (day === undefined || hour === undefined ? 99.99 :
                    parseFloat(`${day < 4 ? day + 7 : day}.${hour.toLocaleString("en-US", { minimumIntegerDigits: 2 })}`)
                ),
                gametime_day: day || 99,
                gametime_hour: hour || 99,
                gametime_time: time
            }
        } else {
            console.log(`${fp_id.player_name} NOT MATCHED!!!`)
        }
    })
    Object.keys(allplayers).filter(id => !allplayers[id].rank_ecr).map(id => {
        allplayers[id].rank_ecr = !allplayers[id].team || teams_playing.includes(allplayers[id].team) ? 999 : 1000
        allplayers[id].week = week
    })
    return (allplayers)
}

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
    const week = Math.max(...Object.keys(allplayers).map(player_id => parseInt(allplayers[player_id]?.week)))

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

    const date = new Date()
    const day = date.getDay()
    const hour = date.getHours()

    const now = parseFloat(`${day < 4 ? day + 7 : day}.${hour.toLocaleString("en-US", { minimumIntegerDigits: 2 })}`)

    let player_ranks = roster.players?.filter(x =>
        (includeTaxi > 0 || !roster.taxi?.includes(x))
    ).map(player => {

        allplayers[player] = {
            ...allplayers[player],
            rank_ecr: allplayers[player]?.rank_ecr || 999,
            gametime: allplayers[player]?.gametime || 99.99
        }
        let rank = allplayers[player]?.rank_ecr
        if (!roster.starters?.includes(player)) {
            rank = (rank + rankMargin)

        } else {
            rank = allplayers[player]?.rank_ecr
        }
        if (includeLocked < 0 && allplayers[player]?.gametime < now && allplayers[player]?.week === week) {
            if (roster.starters.includes(player)) {
                rank = 0
            } else {
                rank = 1000
            }
        }

        return {
            id: player,
            rank: parseInt(rank),
            gametime: allplayers[player]?.gametime
        }
    })

    let optimal_lineup = []
    let player_ranks_filtered = player_ranks
    starting_slots.map((slot, index) => {
        const slot_options = player_ranks_filtered
            .filter(p => position_map[slot].includes(allplayers[p.id]?.position))
            .sort((a, b) => a.rank - b.rank || roster.starters.includes(a.id) - roster.starters.includes(b.id) || a.gametime_day - b.gametime_day || a.gametime_hour - b.gametime_hour)

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
            position_map[slot].includes(allplayers[op]?.position)
        )

        const slot_abbrev = slot
            .replace('SUPER_FLEX', 'SF')
            .replace('FLEX', 'W/R/T')
            .replace('WRRB_FLEX', 'W/R')
            .replace('REC_FLEX', 'W/T')

        lineup_check.push({
            index: index,
            slot: slot,
            slot_abbrev: slot_abbrev,
            cur_id: cur_id,
            cur_rank: allplayers[cur_id]?.rank_ecr,
            gametime: allplayers[cur_id]?.gametime,
            gametime_day: allplayers[cur_id]?.gametime_day,
            gametime_hour: allplayers[cur_id]?.gametime_hour,
            optimal_options: optimal_options,
            isInOptimal: isInOptimal,

        })
    })
    lineup_check = lineup_check.map((lc) => {
        let swaps;
        if (!lc.isInOptimal && lc.optimal_options.length === 0) {
            const swap_out = lineup_check
                .filter(x =>
                    x.isInOptimal && x.optimal_options.length > 0 &&
                    position_map[x.slot].includes(allplayers[lc.cur_id]?.position) &&
                    position_map[lc.slot].includes(allplayers[x.cur_id]?.position)
                )
                .sort((a, b) => a.cur_rank - b.cur_rank)

            swaps = swap_out[0]
        }

        let isInOptimalOrdered;
        let tv_slot = '***'
        if (lc.gametime < 7.13 && lc.isInOptimal) {
            const isInFlex = lc.slot !== allplayers[lc.cur_id]?.position
            const samePos = lineup_check.filter(x =>
                allplayers[x.cur_id]?.position === allplayers[lc.cur_id]?.position &&
                allplayers[x.cur_id]?.position === x.slot &&
                x.gametime > lc.gametime && !(includeLocked < 0 && (lc.gametime < now || x.gametime < now))
            )

            isInOptimalOrdered = (isInFlex && samePos.length > 0) ? 'E' : null
            if (Math.floor(lc.gametime) === 4) {
                tv_slot = 'TNF'
            }
        } else if (lc.isInOptimal && lc.gametime > 7.16) {
            const isInFlex = lc.slot !== allplayers[lc.cur_id]?.position
            const samePos = lineup_check.filter(x =>
                allplayers[x.cur_id]?.position === allplayers[lc.cur_id]?.position &&
                allplayers[x.cur_id]?.position !== x.slot &&
                x.gametime < lc.gametime && !(includeLocked < 0 && (lc.gametime < now || x.gametime < now))
            )

            if (Math.floor(lc.gametime) === 7) {
                tv_slot = 'SNF'
            } else if (Math.floor(lc.gametime) === 8) {
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