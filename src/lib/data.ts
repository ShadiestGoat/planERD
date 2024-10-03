import { writable } from 'svelte/store'
import { type Index, type Table, type Relation, IndexType } from './types'
import { SQLTypes, type SQLType } from './sqlTypes'

/** Table name -> relevant indicies */
export const indices = writable<Record<string, Index[]>>({
    'cool-table': [
        {
            colNames: ['cool_col'],
            type: IndexType.PRIMARY
        },
        {
            colNames: ['cool_col1', 'cool_col2'],
            type: IndexType.UNIQUE
        }
    ]
})
/** Table name -> data */
export const tables = writable<Record<string, Table>>({
    'cool-table': {
        name: 'aaa',
        cols: [
            {
                arrayLevel: 0,
                name: 'cool_col',
                type: 'asdsadasdasd',
                nullable: false
            },
            {
                arrayLevel: 1,
                name: 'cool_col2',
                type: 'string',
                nullable: true
            }
        ]
    }
})

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
