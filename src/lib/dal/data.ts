import { writable } from 'svelte/store'
import { type Index, type Table, type Relation } from '../types'
import { SQLTypes, type SQLType } from '../sqlTypes'

/** Table name -> relevant indicies */
export const indices = writable<Record<string, Index[]>>({})

/** Table name -> data */
export const tables = writable<Record<string, Table>>({})
export const tableOrder = writable<string[]>([])
export const relations = writable<Relation[]>([])
export const enums = writable<Record<string, string[]>>({})

export const rawSQLArgRef: Record<string, string[][]> = Object.fromEntries(
    SQLTypes.map(([_, types]) => types)
        .flat()
        .map((t) => [t.name, t.args])
)

export let allSQLTypes: [string, SQLType[]][] = []
export let sqlArgRef: Record<string, string[][]> = {}

enums.subscribe((v) => {
    const enumNames = Object.keys(v)

    if (enumNames.length == 0) {
        allSQLTypes = SQLTypes
        sqlArgRef = rawSQLArgRef

        return
    }

    allSQLTypes = [['Your Enums', enumNames.map((e) => ({ name: e, args: [] }))], ...SQLTypes]

    sqlArgRef = {
        ...rawSQLArgRef,
        ...Object.fromEntries(enumNames.map((v) => [v, []]))
    }
})
