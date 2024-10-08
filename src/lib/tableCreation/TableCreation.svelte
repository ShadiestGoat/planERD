<script lang="ts">
    import { indices, tables } from '../dal/data'
    import { Plus, Pencil, Check } from 'lucide-svelte'
    import { IndexType, type Index } from '../types'
    import ColCreation from './ColCreation.svelte'
    import IconButton from '$lib/IconButton.svelte'

    import Input from '$lib/utils/Input.svelte'
    import { validateTableName } from './vlidators'
    import { defaultColumn, renameTable } from '$lib/dal/api'

    export let tableName = ''

    $: tableData = $tables[tableName]
    $: tableInd = $indices[tableName] ?? []

    let indexPopup = -1

    function deleteColumn(i: number): void {
        const colData = tableData.cols[i]

        // Delete col data in table data
        $tables[tableName].cols.splice(i, 1)
        $tables[tableName].cols = $tables[tableName].cols

        // Remove ind
        if ($indices[tableName]) {
            $indices[tableName] = $indices[tableName]
                .map((v) => {
                    const ind = v.colNames.indexOf(colData.name)
                    if (ind == -1) return null

                    if (v.colNames.length <= 2) {
                        return null
                    }

                    v.colNames.splice(ind, 1)

                    return v
                })
                .filter((v) => v !== null)
        }

        // TODO: rm relations
    }

    type SingleIndexCache = Record<string, { i: number; v: Index }>

    function makeSingleIndexCache(tableIndices: Index[]): Record<string, { i: number; v: Index }> {
        const cache: SingleIndexCache = {}

        tableIndices.forEach((v, i) => {
            if (!v.colNames.length) return

            cache[v.colNames[0]] = { v, i }
        })

        return cache
    }

    $: singleIndexCache = makeSingleIndexCache(tableInd)

    function setSingleIndex(colName: string, newIndexType: IndexType): void {
        const oldI = singleIndexCache[colName]?.i ?? -1

        if (!$indices[tableName]) {
            $indices[tableName] = []
        }

        if (oldI == -1) {
            if (newIndexType == IndexType.NONE) return

            $indices[tableName] = [
                ...$indices[tableName],
                {
                    colNames: [colName],
                    type: newIndexType
                }
            ]
        } else if (newIndexType == IndexType.NONE) {
            const ind = $indices[tableName]
            ind.splice(oldI, 1)

            $indices[tableName] = ind
        } else {
            $indices[tableName][oldI].type = newIndexType
        }
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

        // TODO: Rename relations
    }

    function addColumn(): void {
        const col = defaultColumn($tables[tableName].cols)

        $tables[tableName].cols.push(col)
        $tables[tableName].cols = $tables[tableName].cols
    }

    $: otherTableNames = Object.keys($tables).filter((v) => v != tableName)

    let editingName = false
    let nameIsGood = true
    let editingNameValue = tableName

    function onEditIcon(): void {
        nameIsGood = true
        editingName = true
    }

    function onNameSubmit(): void {
        if (editingNameValue == tableName) {
            editingName = false
            return
        }

        if (!nameIsGood) return

        renameTable(tableName, editingNameValue)

        tableName = editingNameValue
        editingName = false
    }
</script>

<div class="table-wrapper col">
    <div class="header row">
        {#if editingName}
            <Input
                autofocus
                placeholder="Table Name"
                curValue={editingNameValue}
                isInputGood={validateTableName(otherTableNames)}
                bind:valueIsGood={nameIsGood}
                on:input={({ detail }) => (editingNameValue = detail)}
                on:submit={onNameSubmit}
            />
        {:else}
            <h2>{tableName}</h2>
        {/if}

        <IconButton
            on:input={editingName ? onNameSubmit : onEditIcon}
            extraClass="header-btn {editingName ? 'check' : 'edit'}"
            active={false}
            disabled={!nameIsGood}
        >
            {#if editingName}
                <Check size={24} />
            {:else}
                <Pencil size={20} />
            {/if}
        </IconButton>
    </div>
    <div class="col-container col">
        <div class="row sub-header">
            <h4>Columns</h4>

            <IconButton on:input={addColumn} extraClass="header-btn" active={false} noColor>
                <Plus size={24} class="primary" />
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
    $tableNameFS: 1.5rem;

    .table-wrapper {
        width: 100%;
        background: $bg;
        border-radius: 12.5px;
        padding: 12px;
        gap: 12px;
    }

    .col-container {
        padding-left: 12px;

        &,
        .col-wrapper {
            gap: 12px;
        }
    }

    .col-wrapper {
        padding-left: 12px;
    }

    .sub-header {
        align-items: center;
        justify-content: space-between;
    }

    .header {
        gap: 12px;
        align-items: center;

        h2 {
            font-size: $tableNameFS;
        }

        :global(.edit) {
            --color-active: #{$primary};
            --color-secondary: #{$primary};
        }

        :global(.check) {
            --color-active: #{$green-4};
            --color-secondary: #{$green-4};
        }

        > :global(input) {
            font-size: $tableNameFS;
        }
    }
</style>
