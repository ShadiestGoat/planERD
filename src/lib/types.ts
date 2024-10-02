// place files you want to import through the `$lib` alias in this folder.

export type Column = {
    name: string;
    type: string;
    arrayLevel: number;
    comment?: string;
    nullable: boolean;
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
    type: IndexType;
}

export enum ColRelationType {
    ONE_TO_N,
    N_TO_ONE,
    ONE_TO_ONE,
    ONE_TO_ONE_STRICT,
}

export type ColRelation = {
    colRef: string;
    type: ColRelationType
}

export type Relation = {
    /** These are col refs - tableName.colName */
    from: ColRelation;
    /** These are col refs - tableName.colName */
    to: ColRelation;
}

export type Table = {
    name: string
    cols: Column[]
    comment?: string[]
}
