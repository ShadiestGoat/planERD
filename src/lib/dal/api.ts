import { get } from 'svelte/store'
import { indices, relations, tableOrder, tables } from './data'
import { nodes } from './nodes'
import { ColRelationType, type Column, type Table } from '$lib/types'
import {
    DEFAULT_COL_NAME,
    DEFAULT_COL_TYPE,
    DEFAULT_TABLE_COLUMN,
    DEFAULT_TABLE_NAME
} from './settings'
import { type Node, type XYPosition } from '@xyflow/svelte'

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
        cur[newName].name = newName

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
    // This is a bug compensation - if not done async, it'll break a bunch of component destruction
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

export function tableNode(n: string, pos: XYPosition): Node {
    return {
        id: n,
        type: 'table',
        data: {
            name: n
        },
        position: pos ?? { x: 0, y: 0 }
    }
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
        cur.push(tableNode(t.name, pos))

        return cur
    })
}

export function removeTable(n: string): void {
    tableOrder.update((cur) => {
        cur.splice(
            cur.findIndex((v) => v == n),
            1
        )

        return cur
    })

    nodes.update((cur) => {
        cur.splice(
            cur.findIndex((v) => v.type == 'table' && v.data.name == n),
            1
        )

        return cur
    })

    setTimeout(() => {
        indices.update((cur) => {
            delete cur[n]

            return cur
        })

        tables.update((cur) => {
            delete cur[n]

            return cur
        })
    }, 1)
}

export function addRelation(source: string, dist: string): void {
    relations.update((v) => {
        return [
            ...v,
            {
                type: ColRelationType.ONE_TO_N,
                from: source,
                to: dist
            }
        ]
    })
}

// TODO:
// export function addEdge(r: Relation): void {
// }
