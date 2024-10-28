import { type Writable } from 'svelte/store'
import { indices, relations, tableOrder, tables } from './data'
import { edges, nodes } from './nodes'
import { ColRelationType, type Column, type Table } from '$lib/types'
import {
    DEFAULT_COL_NAME,
    DEFAULT_COL_TYPE,
    DEFAULT_TABLE_COLUMN,
    DEFAULT_TABLE_NAME
} from './settings'
import type { Node, XYPosition, useUpdateNodeInternals } from '@xyflow/svelte'

type UpdateNodeInternals = ReturnType<typeof useUpdateNodeInternals>

abstract class APIBase {
    static DEFAULT_NAME: string
    private updateNodesHook: UpdateNodeInternals | undefined

    constructor(updateNodes: UpdateNodeInternals | undefined) {
        this.updateNodesHook = updateNodes
    }

    protected updateNodes(nodes: string[] | string): void {
        if (!this.updateNodesHook) return
        this.updateNodesHook(nodes)
    }

    protected defer(h: () => void): void {
        setTimeout(h, 1)
    }

    protected removeUtil(oldName: string, d: Writable<Record<string, unknown>>[]): void {
        d.forEach((w) => {
            w.update((cur) => {
                delete cur[oldName]

                return cur
            })
        })
    }

    protected deferRemove(oldName: string, d: Writable<Record<string, unknown>>[]): void {
        this.defer(() => {
            this.removeUtil(oldName, d)
        })
    }

    static defaultName(existing: string[]): string {
        let highest_name = -1

        existing.forEach((v) => {
            if (!v.startsWith(this.DEFAULT_NAME)) {
                return
            }

            let cur_name_n = 0
            if (v.length > this.DEFAULT_NAME.length + 1) {
                const num = parseInt(v.slice(this.DEFAULT_NAME.length + 1))
                if (isNaN(num)) {
                    return
                }

                cur_name_n = num
            }

            if (cur_name_n > highest_name) {
                highest_name = cur_name_n
            }
        })

        return this.DEFAULT_NAME + (highest_name === -1 ? '' : `_${highest_name + 1}`)
    }

    createUtil(existing: string[]): void {
        this.create(APIBase.defaultName(existing))
    }

    abstract create(name: string): void
    abstract delete(name: string): void
    abstract rename(oldName: string, newName: string): void
}

export class APITable extends APIBase {
    static DEFAULT_NAME = DEFAULT_TABLE_NAME

    static node(name: string, pos: XYPosition): Node {
        return {
            id: name,
            type: 'table',
            data: {
                name
            },
            position: pos
        }
    }

    static fullData(name: string): Table {
        return {
            name,
            cols: [{ ...DEFAULT_TABLE_COLUMN }]
        }
    }

    createRaw(d: Table, pos: XYPosition): void {
        tableOrder.update((cur) => {
            return [...cur, d.name]
        })

        tables.update((cur) => {
            cur[d.name] = d

            return cur
        })

        nodes.update((cur) => {
            return [...cur, APITable.node(d.name, pos)]
        })

        this.updateNodes(d.name)
    }

    create(name: string): void {
        this.createRaw(APITable.fullData(name), { x: 0, y: 0 })
    }

    rename(oldName: string, newName: string): void {
        indices.update((cur) => {
            if (!cur[oldName]) return cur

            cur[newName] = cur[oldName]
            return cur
        })

        tables.update((cur) => {
            cur[newName] = cur[oldName]
            cur[newName].name = newName

            return cur
        })

        nodes.update((cur) => {
            const nID = cur.findIndex((v) => v.type == 'table' && v.data?.name == oldName)
            cur[nID].data.name = newName
            cur[nID].id = newName

            return cur
        })

        this.updateNodes([oldName, newName])

        tableOrder.update((cur) => {
            cur[cur.indexOf(oldName)] = newName

            return cur
        })

        edges.update((cur) => {
            return cur.map((v) => {
                ;(['source', 'target'] as const).forEach((p) => {
                    if (v[p] == oldName) return
                    const otherK = `${p}Handle` as const

                    if (!v[otherK]) return

                    v[p] = newName
                    v[otherK] = newName + v[otherK]?.slice(oldName.length)
                })

                return v
            })
        })

        relations.update((cur) => {
            return cur.map((v) => {
                ;(['to', 'from'] as const).forEach((k) => {
                    if (v[k].startsWith(oldName + ' ')) {
                        v[k] = newName + v[k].slice(oldName.length)
                    }
                })

                return v
            })
        })

        this.deferRemove(oldName, [indices, tables])
    }

    delete(name: string): void {
        tableOrder.update((cur) => {
            const i = cur.indexOf(name)
            if (i == -1) return cur

            cur.splice(i, 1)

            return cur
        })

        nodes.update((cur) => {
            const i = cur.findIndex((v) => v.type == 'table' && v.data.name == name)
            if (i == -1) return cur

            cur.splice(i, 1)

            return cur
        })

        this.updateNodes(name)

        this.defer(() => {
            this.removeUtil(name, [indices, tables])

            relations.update((cur) => {
                return cur.filter(
                    (r) => !(r.to.startsWith(name + ' ') || r.from.startsWith(name + ' '))
                )
            })
        })
    }
}

export function defaultColumn(cols: Column[]): Column {
    return {
        arrayLevel: 0,
        name: 'a',
        // defaultName(
        //     DEFAULT_COL_NAME,
        //     cols.map((v) => v.name)
        // ),
        nullable: false,
        type: DEFAULT_COL_TYPE
    }
}

export function addRelation(source: string, dist: string): void {
    relations.update((v) => {
        return [
            ...v,
            {
                type: ColRelationType.ONE_TO_N,
                from: source,
                to: dist
            }
        ]
    })
}
