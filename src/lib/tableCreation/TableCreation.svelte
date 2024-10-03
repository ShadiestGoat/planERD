<script lang="ts">
	import { allSQLTypes, indices, tables } from "../data";
	import { GripVertical, Ghost, Trash2 } from "lucide-svelte";
	import TableCreationIcon from "./TableCreationIcon.svelte";
	import { IndexType, type Index } from "../types";
	import IndexPopup from "./IndexPopup.svelte";
	import IndexIcon from "./IndexIcon.svelte";

    export let tableName = ""

    $: tableData = $tables[tableName]
    $: tableInd = $indices[tableName] ?? []

    function deleteColumn(i: number) {
        const colData = tableData.cols[i]

        // Del input data
        delete colInputStates[colData.name]

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

    function setColNull(i: number) {
        $tables[tableName].cols[i].nullable = !$tables[tableName].cols[i].nullable
    }

    let indexPopup = -1

    function openIndexPopup(col: number) {
        if (indexPopup == col) {
            indexPopup = -1
        } else {
            indexPopup = col
        }
    }

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
        console.log(oldI, singleIndexCache)

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

    let colInputStates: Record<string, {
        good: boolean,
        value: string
    }> = $tables[tableName] ? Object.fromEntries(
        $tables[tableName].cols.map(
            v => [
                v.name,
                {
                    good: true,
                    value: v.name
                }
            ]
        )
    ) : {}

    function onColumnNameInput(i: number, re: Event) {
        // typescript, am i right?
        const e = re as InputEvent & { target: HTMLInputElement }
        const lastGoodName = $tables[tableName].cols[i].name

        const newName = e.target.value
        if (!newName || newName.includes(" ")) {
            colInputStates[lastGoodName].good = false

            return
        }


        // Rename the input data
        delete colInputStates[lastGoodName]
        colInputStates[newName] = {
            value: newName,
            good: true
        }

        // Rename real table col
        $tables[tableName].cols[i].name = newName

        // Rename indices
        if ($indices[tableName]) {
            $indices[tableName].forEach((v, j) => {
                const lastGood = v.colNames.indexOf(lastGoodName)
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
        <div class="sub-header">
            <h4>Columns</h4>
        </div>

        <div class="col-wrapper col">
            {#each tableData.cols as col, i}
                {@const singleIndex = singleIndexCache[col.name]}

                <div class="col-data">
                    <GripVertical size={18} color="white" />
                    <input
                        class="{colInputStates[col.name].good ? '' : 'bad'}"
                        placeholder="Column Name"
                        type="text"
                        bind:value={colInputStates[col.name].value}
                        on:input={(e) => onColumnNameInput(i, e)}
                    />

                    <select bind:value={$tables[tableName].cols[i].type}>
                        {#each allSQLTypes as typeGroup}
                            <optgroup label={typeGroup[0]}>
                                {#each typeGroup[1] as t}
                                    <option value="{t.name}">{t.name}</option>
                                {/each}
                            </optgroup>
                        {/each}
                    </select>

                    <!-- args -->
                    <div />
                    <div />

                    <TableCreationIcon
                        cls="nullable"
                        active={col.nullable}
                        on:input={() => setColNull(i)}
                    >
                        <Ghost size={18} />
                    </TableCreationIcon>

                    {#if i == indexPopup}
                        <IndexPopup
                            curIndexType={singleIndex ? singleIndex.v.type : IndexType.NONE}
                            on:input={({ detail }) => {
                                setSingleIndex(col.name, detail)
                                openIndexPopup(-1)
                            }}
                        />
                    {/if}

                    <TableCreationIcon
                        cls="special"
                        active={!!singleIndex}
                        on:input={() => openIndexPopup(i)}
                    >
                        <IndexIcon
                            size={18}
                            active={!!singleIndex}
                            type={singleIndex ? singleIndex.v.type : IndexType.NONE}
                        />
                    </TableCreationIcon>
                    
                    <TableCreationIcon
                        cls="trash"
                        active={false}
                        on:input={() => deleteColumn(i)}
                    >
                        <Trash2 size={18} />
                    </TableCreationIcon>
                </div>
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

    .col-data {
        display: grid;
        position: relative;

        justify-items: center;
        align-items: center;
        gap: 4px;

        //                   draggable
        grid-template: 1fr / 24px
        //                   col name, type, args (1), args (2)
                             12ch      12ch  2ch     2ch
                             // empty space  
                             1fr
        //                   nullable, index type, trash
                             repeat(3, 26px);
    }

    input, select {
        border: none;
        background: $gray-9;
        padding: 0.25rem 0.5rem;
        width: 100%;
        border-radius: 6.25px;
        color: $primary;
        --outline-color: #{$primary};

        &.bad {
            --outline-color: #{$danger};
        }

        &:focus-within {
            outline: var(--outline-color) 1px solid;
        }
    }
</style>