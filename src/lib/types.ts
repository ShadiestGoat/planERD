// place files you want to import through the `$lib` alias in this folder.

export type Column = {
    name: string
    type: string
    arrayLevel: number
    comment?: string
    nullable: boolean
}

export enum IndexType {
    INDEX,
    UNIQUE,
    PRIMARY,
    // This should never be present on a real index, but its useful for other things
    NONE
}

export type Index = {
    colNames: string[]
    type: IndexType
}

export enum ColRelationType {
    ONE_TO_N,
    N_TO_ONE,
    ONE_TO_ONE,
    ONE_TO_ONE_STRICT
}

export type Relation = {
    type: ColRelationType
    /** These are col refs - 'tableName colName' */
    from: string
    /** These are col refs - 'tableName colName' */
    to: string
}

export type Table = {
    name: string
    cols: Column[]
    comment?: string[]
}
