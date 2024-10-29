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
    TO_ONE,
    TO_MANY,
    TO_ONE_STRICT,
    TO_MANY_STRICT,
    TO_ONE_OPTIONAL
}

export type Relation = {
    fromType: ColRelationType
    toType: ColRelationType
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
