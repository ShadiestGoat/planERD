<script lang="ts">
	import { indices, tables } from "../data";
	import { Plus } from "lucide-svelte";
	import { IndexType, type Index } from "../types";
	import ColCreation from "./ColCreation.svelte";
	import IconButton from "$lib/IconButton.svelte";

    export let tableName = ""

    $: tableData = $tables[tableName]
    $: tableInd = $indices[tableName] ?? []

    function deleteColumn(i: number) {
        const colData = tableData.cols[i]

        // Delete col data in table data
        $tables[tableName].cols.splice(i, 1)
        $tables[tableName].cols = $tables[tableName].cols

        // Remove ind
        if ($indices[tableName]) {
            $indices[tableName] = $indices[tableName].map((v) => {
                const ind = v.colNames.indexOf(colData.name)
                if (ind == -1) return null

                if (v.colNames.length <= 2) {
                    return null
                }

                v.colNames.splice(ind, 1)

                return v
            }).filter(v => v !== null)
        }

        // TODO: rm relations
    }

    let indexPopup = -1

    type SingleIndexCache = Record<string, { i: number, v: Index }>

    function makeSingleIndexCache(tableIndices: Index[]): Record<string, { i: number, v: Index }> {
        const cache: SingleIndexCache = {}

        tableIndices.forEach((v, i) => {
            if (!v.colNames.length) return

            cache[v.colNames[0]] = { v, i }
        })

        return cache
    }

    $: singleIndexCache = makeSingleIndexCache(tableInd)

    function setSingleIndex(colName: string, newIndexType: IndexType) {
        const oldI = singleIndexCache[colName]?.i ?? -1

        if (oldI == -1) {
            if (newIndexType == IndexType.NONE) return

            $indices[tableName] = [
                ...$indices[tableName],
                {
                    colNames: [colName],
                    type: newIndexType,
                }
            ]
        } else if (newIndexType == IndexType.NONE) {
            const ind = $indices[tableName]
            ind.splice(oldI, 1)

            $indices[tableName] = ind
        } else {
            $indices[tableName][oldI].type = newIndexType
        }

        console.log($indices[tableName])
    }

    function onColumnRename(i: number, newName: string) {
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

        // TODO: Rename relations
    }
</script>

<div class="table-wrapper col">
    <div class="header row">
        <h2>{tableName}</h2>
    </div>
    <div class="col-container col">
        <div class="row sub-header">
            <h4>Columns</h4>
            <IconButton active={false}>
                <Plus size={18} color="white" />
            </IconButton>
        </div>

        <div class="col-wrapper col">
            {#each tableData.cols as col, i}
                <ColCreation
                    colIndex={i}
                    bind:indexPopup
                    singleIndex={singleIndexCache[col.name]?.v}
                    {tableName}
                    colNameValue={col.name}

                    on:delete={() => deleteColumn(i)}
                    on:setIndex={({ detail }) => setSingleIndex(col.name, detail)}
                    on:setName={({ detail }) => onColumnRename(i, detail)}
                />
            {/each}
        </div>
    </div>
    <div class="indicies">
        <!-- {#each} -->
    </div>
</div>

<style lang="scss">
    .table-wrapper {
        width: 100%;
        background: $bg;
        border-radius: 12.5px;
        padding: 12px;
        gap: 12px;
    }

    .col-container {
        padding-left: 12px;

        &, .col-wrapper {
            gap: 12px;
        }
    }

    .col-wrapper {
        padding-left: 12px;
    }

    .sub-header {
        justify-content: space-between;
    }
</style>