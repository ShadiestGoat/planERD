import type { Node, XYPosition } from "@xyflow/svelte"
import type { Index, Table } from "$lib/types"
import { nodes } from "./nodes"
import { indices, tableOrder, tables } from "./data"
import { get } from "svelte/store"
import { tableNode } from "./api"

export let dataLoaded = false

export enum StorageKeys {
    POS = 'xy',
    TABLES = 'tables',
    INDICES = 'indices',
    // RELATIONS = 'relations'
}

type StorageData = {
    [StorageKeys.POS]: Record<string, XYPosition>,
    [StorageKeys.TABLES]: Table[],
    [StorageKeys.INDICES]: Record<string, Index[]>,
    // [StorageKeys.RELATIONS]: Relation[],
}

function savePos(allNodes: Node[]): void {
    localStorage.setItem(StorageKeys.POS, JSON.stringify(
        Object.fromEntries(
            allNodes.map(n => {
                return [`${n.type}-${n.id}`, n.position]
            })
        )
    ))
}

export function saveTables(order: string[], tables: Record<string, Table>): void {
    const d = order.map(n => tables[n])

    localStorage.setItem(StorageKeys.TABLES, JSON.stringify(d))
}

export function saveIndices(ind: Record<string, Index[]>): void {
    localStorage.setItem(StorageKeys.INDICES, JSON.stringify(ind))
}

nodes.subscribe(v => {
    if (!dataLoaded) return

    setTimeout(() => {
        savePos(v)
    }, 1)
})

tableOrder.subscribe(v => {
    if (!dataLoaded) return

    setTimeout(() => {
        saveTables(v, get(tables))
    }, 1)
})

tables.subscribe(v => {
    if (!dataLoaded) return

    setTimeout(() => {
        saveTables(get(tableOrder), v)
    }, 1)
})

indices.subscribe(v => {
    if (!dataLoaded) return

    setTimeout(() => {
        saveIndices(v)
    })
})

async function readLocalStorageAsync<K extends StorageKeys>(k: K, defVal: StorageData[K]): Promise<StorageData[K]> {
    const d = localStorage.getItem(k)

    if (!d) return defVal
    return JSON.parse(d)
}

export async function loadData(): Promise<void> {
    if (dataLoaded) return

    const [dataPos, dataIndex, dataTable] = await Promise.all([
        readLocalStorageAsync(StorageKeys.POS, {}),
        readLocalStorageAsync(StorageKeys.INDICES, {}),
        readLocalStorageAsync(StorageKeys.TABLES, []),
    ])

    const order = dataTable.map(v => v.name)
    const realTables = Object.fromEntries(
        dataTable.map(v => {
            return [v.name, v]
        })
    )

    tables.set(realTables)
    tableOrder.set(order)

    const loadedNodes = Object.keys(dataPos).map(n => {
        const ind = n.indexOf("-")
        if (ind == -1) return null

        const nodeType = n.slice(0, ind)
        const name = n.slice(ind + 1)

        if (nodeType != 'table') return null

        return tableNode(name, dataPos[n])
    }).filter(v => v !== null)

    nodes.set(loadedNodes)

    indices.set(dataIndex)

    dataLoaded = true
}