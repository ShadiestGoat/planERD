export type SQLType = {
    name: string
    args: string[][]
}

type SQLTypeBigConf = {
    name: string

    args?: string[][] | string[]
}

type SQLTypeConf = SQLTypeBigConf | string

const customNumericArgs: SQLTypeBigConf['args'] = [['precision'], ['precision', 'scale']]

const numeric: SQLTypeConf[] = [
    'smallint',
    'integer',
    'bigint',

    {
        name: 'decimal',
        args: customNumericArgs
    },
    {
        name: 'numeric',
        args: customNumericArgs
    },

    'real',
    'double precision',
    'smallserial',
    'serial',
    'bigserial'
]

const character: SQLTypeConf[] = [
    {
        name: 'varchar',
        args: ['n']
    },
    {
        name: 'char',
        args: ['n']
    },
    'bpchar',
    'text'
]

const timestamp: SQLTypeConf[] = [
    'timestamp',
    'timestamptz',
    'date',
    'time with time zone',
    'time without time zone',
    'interval'
]

const geometric: SQLTypeConf[] = ['point', 'line', 'lseg', 'box', 'path', 'polygon', 'circle']

const network: SQLTypeConf[] = ['cidr', 'inet', 'macaddr', 'macaddr8']

const bit: SQLTypeConf[] = [
    {
        name: 'bit',
        args: ['n']
    },
    {
        name: 'bit varying',
        args: ['n']
    }
]

const dataConf: [string, SQLTypeConf[]][] = [
    ['Numeric', numeric],
    ['Monetary', ['money']],
    ['Character', character],
    ['Binary', ['bytea']],
    ['Date/Time', timestamp],
    ['Boolean', ['boolean']],
    ['Geometric', geometric],
    ['Network Address', network],
    ['Bit String', bit],
    ['Text Search', ['tsvector']],
    ['Misc', ['uuid', 'jsonb', 'xml']]
]

function parseSQLTypeConf(t: SQLTypeConf): SQLType {
    if (typeof t === 'string') {
        return {
            name: t,
            args: []
        }
    }

    const args = (!t.args?.length ? [] : Array.isArray(t.args[0]) ? t.args : [t.args]) as string[][]

    return {
        name: t.name,
        args
    }
}

export const SQLTypes: [string, SQLType[]][] = dataConf.map((v) => {
    return [v[0] + ' Types', v[1].map(parseSQLTypeConf)]
})
