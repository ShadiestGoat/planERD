import type { XYPosition } from '@xyflow/svelte'
import type { Index, Relation, Table } from '$lib/types'
import { edges, nodes } from './nodes'
import { indices, multiColIndexExceptions, relations, tableOrder, tables } from './data'
import { get } from 'svelte/store'
import { APITable } from './api'

export let dataLoaded = false

export enum StorageKeys {
    POS = 'xy',
    TABLES = 'tables',
    INDICES = 'indices',
    MULTI_COL_EXCEPTIONS = 'multi_col_exceptions',
    RELATIONS = 'relations'
}

type StorageData = {
    [StorageKeys.POS]: Record<string, XYPosition>
    [StorageKeys.TABLES]: Table[]
    [StorageKeys.INDICES]: Record<string, Index[]>
    [StorageKeys.MULTI_COL_EXCEPTIONS]: Record<string, number[]>
    [StorageKeys.RELATIONS]: Relation[]
}

type ParsingFunc<T, D> = (v: T) => D

function genericSave<
    T,
    K extends StorageKeys,
    D = StorageData[K],
    F = T extends D ? undefined : ParsingFunc<T, D>
>(k: K, parse?: F): (v: T) => void {
    return (v) => {
        if (!dataLoaded) return

        setTimeout(() => {
            const d = parse ? (parse as ParsingFunc<T, D>)(v) : (v as unknown as D)
            localStorage.setItem(k, JSON.stringify(d))
        }, 1)
    }
}

nodes.subscribe(
    genericSave(StorageKeys.POS, (v) => {
        return Object.fromEntries(
            v.map((n) => {
                return [`${n.type}-${n.id}`, n.position]
            })
        )
    })
)

function parseTables(order: string[], tableData: Record<string, Table>): Table[] {
    return order.map((n) => tableData[n])
}

tableOrder.subscribe(genericSave(StorageKeys.TABLES, (v) => parseTables(v, get(tables))))
tables.subscribe(genericSave(StorageKeys.TABLES, (v) => parseTables(get(tableOrder), v)))

indices.subscribe(genericSave(StorageKeys.INDICES))
relations.subscribe(genericSave(StorageKeys.RELATIONS))

multiColIndexExceptions.subscribe(
    genericSave(StorageKeys.MULTI_COL_EXCEPTIONS, (v) =>
        Object.fromEntries(Object.keys(v).map((k) => [k, Array.from(v[k])]))
    )
)

async function readLocalStorageAsync<K extends StorageKeys>(
    k: K,
    defVal: StorageData[K]
): Promise<StorageData[K]> {
    const d = localStorage.getItem(k)

    if (!d) return defVal
    return JSON.parse(d)
}

export async function loadData(): Promise<void> {
    if (dataLoaded) return

    const [dataPos, dataIndex, dataTable, exceptions, dataRelations] = await Promise.all([
        readLocalStorageAsync(StorageKeys.POS, {}),
        readLocalStorageAsync(StorageKeys.INDICES, {}),
        readLocalStorageAsync(StorageKeys.TABLES, []),
        readLocalStorageAsync(StorageKeys.MULTI_COL_EXCEPTIONS, {}),
        readLocalStorageAsync(StorageKeys.RELATIONS, [])
    ])

    const order = dataTable.map((v) => v.name)
    const realTables = Object.fromEntries(
        dataTable.map((v) => {
            return [v.name, v]
        })
    )

    tables.set(realTables)
    tableOrder.set(order)

    const loadedNodes = Object.keys(dataPos)
        .map((n) => {
            const ind = n.indexOf('-')
            if (ind == -1) return null

            const nodeType = n.slice(0, ind)
            const name = n.slice(ind + 1)

            if (nodeType != 'table') return null
            if (!realTables[name]) return null

            return APITable.node(name, dataPos[n])
        })
        .filter((v) => v !== null)

    nodes.set(loadedNodes)

    indices.set(dataIndex)

    multiColIndexExceptions.set(
        Object.fromEntries(Object.keys(exceptions).map((k) => [k, new Set(exceptions[k])]))
    )
    relations.set(dataRelations)

    edges.set(
        dataRelations.map((v) => {
            return {
                id: `${v.from} -> ${v.to}`,
                source: v.from.split(' ')[0],
                target: v.to.split(' ')[0],
                sourceHandle: `${v.from} sl`,
                targetHandle: `${v.to} tl`
            }
        })
    )

    dataLoaded = true
}
