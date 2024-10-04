import { get } from 'svelte/store'
import { indices, tableOrder, tables } from './data'
import { nodes } from './nodes'
import type { Column, Table } from '$lib/types'
import {
    DEFAULT_COL_NAME,
    DEFAULT_COL_TYPE,
    DEFAULT_TABLE_COLUMN,
    DEFAULT_TABLE_NAME
} from './settings'
import { type XYPosition } from '@xyflow/svelte'

export function renameTable(oldName: string, newName: string): void {
    const curIndices = get(indices)

    if (curIndices[oldName]) {
        // Rename the indices
        curIndices[newName] = curIndices[oldName]

        indices.set(curIndices)

        delete curIndices[oldName]
    }

    tables.update((cur) => {
        cur[newName] = cur[oldName]

        return cur
    })

    nodes.update((cur) => {
        const nID = cur.findIndex((v) => v.type == 'table' && v.data?.name == oldName)
        cur[nID].data.name = newName
        cur[nID].id = newName

        return cur
    })

    tableOrder.update((cur) => {
        cur[cur.indexOf(oldName)] = newName

        return cur
    })

    // Now we delete our shit

    setTimeout(() => {
        if (curIndices[oldName]) {
            indices.set(curIndices)
        }

        tables.update((cur) => {
            delete cur[oldName]

            return cur
        })
    }, 1)
}

function defaultName(def: string, all: string[]): string {
    let highest_name = -1

    all.forEach((v) => {
        if (!v.startsWith(def)) {
            return
        }

        let cur_name_n = 0
        if (v.length > def.length + 1) {
            const num = parseInt(v.slice(def.length + 1))
            if (isNaN(num)) {
                return
            }

            cur_name_n = num
        }

        if (cur_name_n > highest_name) {
            highest_name = cur_name_n
        }
    })

    return def + (highest_name === -1 ? '' : `_${highest_name + 1}`)
}

export function defaultColumn(cols: Column[]): Column {
    return {
        arrayLevel: 0,
        name: defaultName(
            DEFAULT_COL_NAME,
            cols.map((v) => v.name)
        ),
        nullable: false,
        type: DEFAULT_COL_TYPE
    }
}

export function defaultTable(): Table {
    const tableNames = get(tableOrder)

    const t: Table = {
        name: defaultName(DEFAULT_TABLE_NAME, tableNames),
        cols: [{ ...DEFAULT_TABLE_COLUMN }]
    }

    return t
}

export function addTableData(t: Table, pos?: XYPosition): void {
    tableOrder.update((cur) => {
        cur.push(t.name)

        return cur
    })

    tables.update((cur) => {
        cur[t.name] = t

        return cur
    })

    if (!pos) {
        pos = { x: 0, y: 0 }
    }

    nodes.update((cur) => {
        console.log(cur)

        cur.push({
            id: t.name,
            type: 'table',
            data: {
                name: t.name
            },
            position: pos
        })

        return cur
    })
}

// TODO:
// export function removeTable(): void {
// }
