<script lang="ts">
    import { indices } from '$lib/dal/data'
    import { multiColIndexExceptions } from '$lib/dal/tmpData'
    import { IndexType, type Index, type Table } from '$lib/types'
    import SectionBase from './SectionBase.svelte'
    import IndexCreation from './utils/indices/IndexCreation.svelte'

    export let tableData: Table
    $: tableName = tableData.name

    if (!$multiColIndexExceptions[tableData.name]) {
        $multiColIndexExceptions[tableData.name] = new Set()
    }

    if (!$indices[tableName]) {
        $indices[tableName] = []
    }

    function add(): void {
        $indices[tableName] = [
            ...$indices[tableName],
            {
                type: IndexType.INDEX,
                colNames: tableData.cols.slice(0, 2).map((v) => v.name)
            }
        ]
    }

    let dropdown = -1

    function mkUsefulIndex(allIndices: Index[], exceptions: Set<number>): number[] {
        let cache = allIndices.map((v, i) => ({ v, i }))

        return cache.filter((v) => {
            return v.v.colNames.length > 1 || exceptions?.has(v.i)
        }).map(v => v.i)
    }

    function removeIndex(i: number): void {
        dropdown = -1

        $multiColIndexExceptions[tableName] = new Set(
            Array.from($multiColIndexExceptions[tableName] ?? []).map(v => {
                if (v == i) {
                    return null
                } else if (v < i) {
                    return v
                } else {
                    return v - 1
                }
            }).filter(v => v !== null)
        )
        $indices[tableName].splice(i, 1)
        $indices[tableName] = $indices[tableName]
    }

    $: usefulIndex = mkUsefulIndex($indices[tableName], $multiColIndexExceptions[tableName])
</script>

<SectionBase title="Indices" disableAdd={tableData.cols.length < 2} on:add={add}>
    <!-- TODO: Highlight indices red if theyre duplicates (or if len() < 2) -->
    {#each usefulIndex as i}
        <IndexCreation
            bind:dropdownID={dropdown}
            bind:curColNames={$indices[tableName][i].colNames}
            bind:indexType={$indices[tableName][i].type}
            indexIndex={i}
            tableName={tableName}
            on:delete={() => removeIndex(i)}
        />
    {/each}
</SectionBase>

