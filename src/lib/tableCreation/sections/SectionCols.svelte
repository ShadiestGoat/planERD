<script lang="ts">
    import SectionBase from './SectionBase.svelte'
    import type { Index, Table } from '$lib/types'
    import { IndexType } from '$lib/types'
    import { indices, tables, multiColIndexExceptions, relations } from '$lib/dal/data'
    import ColCreation from './utils/cols/ColCreation.svelte'
    import { defaultColumn } from '$lib/dal/api'
    import { edges } from '$lib/dal/nodes'

    export let tableData: Table

    $: tableName = tableData.name

    type SingleIndexCache = Record<string, { i: number; v: Index }>
    function makeSingleIndexCache(
        tableIndices: Index[],
        exceptions?: Set<number>
    ): SingleIndexCache {
        if (!tableIndices || tableIndices.length == 0) return {}

        const cache: SingleIndexCache = {}

        tableIndices.forEach((v, i) => {
            if (v.colNames.length != 1) return
            if (exceptions?.has(i)) return

            cache[v.colNames[0]] = { v, i }
        })

        return cache
    }

    /** A record of col name -> data about all the single-column-indices */
    $: singleIndexCache = makeSingleIndexCache(
        $indices[tableName],
        $multiColIndexExceptions[tableName]
    )

    function setSingleIndex(colName: string, newIndexType: IndexType): void {
        const oldI = singleIndexCache[colName]?.i ?? -1

        if (!$indices[tableName]) {
            $indices[tableName] = []
        }

        if (oldI == -1) {
            // In case we don't have an index already
            if (newIndexType == IndexType.NONE) return

            $indices[tableName] = [
                ...$indices[tableName],
                {
                    colNames: [colName],
                    type: newIndexType
                }
            ]
        } else if (newIndexType == IndexType.NONE) {
            // The case where we are removing an index
            const ind = $indices[tableName]
            ind.splice(oldI, 1)

            $indices[tableName] = ind
        } else {
            $indices[tableName][oldI].type = newIndexType
        }
    }

    function deleteColumn(i: number): void {
        const colData = tableData.cols[i]

        // Delete col data in table data
        $tables[tableName].cols.splice(i, 1)
        $tables[tableName].cols = $tables[tableName].cols

        // Remove ind
        if ($indices[tableName]) {
            $indices[tableName] = $indices[tableName]
                .map((v, i) => {
                    const ind = v.colNames.indexOf(colData.name)
                    if (ind == -1) return v

                    if (v.colNames.length == 1) {
                        return null
                    }

                    v.colNames.splice(ind, 1)
                    if (v.colNames.length == 1) {
                        if (!$multiColIndexExceptions[tableName]) {
                            $multiColIndexExceptions[tableName] = new Set([i])
                        } else {
                            $multiColIndexExceptions[tableName].add(i)
                            $multiColIndexExceptions[tableName] =
                                $multiColIndexExceptions[tableName]
                        }
                    }

                    return v
                })
                .filter((v) => v !== null)
        }

        $relations = $relations.filter((v) => {
            return !(v.from.includes(` ${colData.name} `) || v.to.includes(` ${colData.name} `))
        })
        $edges = $edges.filter((v) => {
            return !(
                v.sourceHandle?.startsWith(`${tableName} ${colData.name}`) ||
                v.targetHandle?.startsWith(`${tableName} ${colData.name}`)
            )
        })
    }

    function onColumnRename(i: number, newName: string): void {
        const oldName = $tables[tableName].cols[i].name

        // Rename real table col
        $tables[tableName].cols[i].name = newName

        // Rename indices
        if ($indices[tableName]) {
            $indices[tableName].forEach((v, j) => {
                const lastGood = v.colNames.indexOf(oldName)
                if (lastGood == -1) return

                $indices[tableName][j].colNames[lastGood] = newName
            })
        }

        $relations = $relations.map((v) => {
            const og = `${tableName} ${oldName}`,
                newCol = `${tableName} ${newName}`

            if (v.from == og) {
                v.from = newCol
            }
            if (v.to == og) {
                v.to = newCol
            }

            return v
        })

        $edges = $edges.map((v) => {
            ;(['source', 'target'] as const).forEach((k) => {
                if (v[k] == tableName) {
                    if (v[`${k}Handle`]?.startsWith(tableName + ' ' + newName + ' ')) {
                        v[`${k}Handle`] = tableName + ' ' + newName + v[k].slice(-3)
                    }
                }
            })

            return v
        })
    }

    function addColumn(): void {
        const col = defaultColumn($tables[tableName].cols)

        $tables[tableName].cols = [...$tables[tableName].cols, col]
    }
</script>

<SectionBase title="Columns" on:add={addColumn}>
    {#each tableData.cols as col, i}
        <ColCreation
            colIndex={i}
            bind:colType={$tables[tableName].cols[i].type}
            bind:isNull={$tables[tableName].cols[i].nullable}
            singleIndex={singleIndexCache[col.name]?.v}
            {tableName}
            colNameValue={col.name}
            on:delete={() => deleteColumn(i)}
            on:setIndex={({ detail }) => setSingleIndex(col.name, detail)}
            on:setName={({ detail }) => onColumnRename(i, detail)}
        />
    {/each}
</SectionBase>
