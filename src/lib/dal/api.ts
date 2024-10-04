import { get } from "svelte/store"
import { indices, tableOrder, tables } from "./data"
import { nodes } from "./nodes"
import type { Column, Table } from "$lib/types"
import { DEFAULT_COL_NAME, DEFAULT_COL_TYPE } from "./settings"
import { type XYPosition } from "@xyflow/svelte"

export function renameTable(oldName: string, newName: string): void {
    const curIndices = get(indices)

    if (curIndices[oldName]) {
        // Rename the indices
        curIndices[newName] = curIndices[oldName]

        indices.set(curIndices)

        delete curIndices[oldName]
    }

    tables.update(cur => {
        cur[newName] = cur[oldName]

        return cur
    })

    nodes.update(cur => {
        const nID = cur.findIndex(v => v.type == 'table' && v.data?.name == oldName)
        cur[nID].data.name = newName
        cur[nID].id = newName

        return cur
    })

    tableOrder.update(cur => {
        cur[cur.indexOf(oldName)] = newName

        return cur
    })

    // Now we delete our shit

    setTimeout(() => {
        if (curIndices[oldName]) {
            indices.set(curIndices)
        }

        tables.update(cur => {
            delete cur[oldName]

            return cur
        })
    }, 1)

}

export function defaultColumn(cols: Column[]): Column {
    let highest_col_name = -1

    cols.forEach((v) => {
        if (!v.name.startsWith(DEFAULT_COL_NAME)) {
            return
        }

        let col_n = 0
        if (v.name.length > DEFAULT_COL_NAME.length + 1) {
            const num = parseInt(v.name.slice(DEFAULT_COL_NAME.length + 1))
            if (isNaN(num)) {
                return
            }

            col_n = num
        }

        if (col_n > highest_col_name) {
            highest_col_name = col_n
        }
    })

    return {
        arrayLevel: 0,
        name: DEFAULT_COL_NAME + (highest_col_name === -1 ? '' : `_${highest_col_name + 1}`),
        nullable: false,
        type: DEFAULT_COL_TYPE
    }
}

export function addTable(name: string): Table {
    const t: Table = {
        cols: [
            defaultColumn([])
        ],
        name,
    }

    addTableData(t)

    return t
}

export function addTableData(t: Table, pos?: XYPosition): void {
    tableOrder.update(cur => {
        cur.push(t.name)

        return cur
    })

    tables.update(cur => {
        cur[t.name] = t

        return cur
    })

    if (!pos) {
        pos = { x: 0, y: 0 }
    }

    nodes.update(cur => {
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
