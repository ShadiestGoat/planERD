import { get } from 'svelte/store'
import { indices, relations, tableOrder, tables } from './data'
import { edges, nodes } from './nodes'
import { ColRelationType, type Column, type Table } from '$lib/types'
import {
    DEFAULT_COL_NAME,
    DEFAULT_COL_TYPE,
    DEFAULT_TABLE_COLUMN,
    DEFAULT_TABLE_NAME
} from './settings'
import { type Edge, type Node, type XYPosition } from '@xyflow/svelte'

function renameEdgeTable(e: Edge, p: 'source' | 'target', oldName: string, newName: string): Edge {
    if (e[p] == oldName) {
        e[p] = newName

        if (e[`${p}Handle`]) {
            e[`${p}Handle`] = newName + e[`${p}Handle`]?.slice(oldName.length)
        }
    }

    return e
}

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

    edges.update((cur) => {
        return cur.map((v) => {
            v = renameEdgeTable(v, 'source', oldName, newName)
            v = renameEdgeTable(v, 'target', oldName, newName)

            return v
        })
    })

    relations.update((cur) => {
        return cur.map((v) => {
            if (v.from.startsWith(oldName + ' ')) {
                v.from = newName + v.from.slice(oldName.length)
            }
            if (v.to.startsWith(oldName + ' ')) {
                v.to = newName + v.to.slice(oldName.length)
            }

            return v
        })
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
        const i = cur.indexOf(n)
        if (i == -1) return cur

        cur.splice(i, 1)

        return cur
    })

    nodes.update((cur) => {
        const i = cur.findIndex((v) => v.type == 'table' && v.data.name == n)
        if (i == -1) return cur

        cur.splice(i, 1)

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

        relations.update((cur) => {
            return cur.filter((r) => !(r.to.startsWith(n + ' ') || r.from.startsWith(n + ' ')))
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
