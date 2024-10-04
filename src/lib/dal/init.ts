import type { Table } from '$lib/types'
import { addTableData } from './api'

export const testTables: Record<string, Table> = {
    'cool-table': {
        name: 'cool-table',
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
    },
    'cool-table-2': {
        name: 'cool-table-2',
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
}

let alrDone = false

export function initData(): void {
    if (alrDone) return

    for (const t in testTables) {
        addTableData(testTables[t])
    }

    alrDone = true
}
