import type { Column } from '$lib/types'

export const DEFAULT_COL_TYPE = 'text'
export const DEFAULT_COL_NAME = 'col_name'

export const DEFAULT_TABLE_NAME = 'table'
export const DEFAULT_TABLE_COLUMN: Column = {
    name: 'id',
    type: DEFAULT_COL_TYPE,
    nullable: false,
    arrayLevel: 0
}
