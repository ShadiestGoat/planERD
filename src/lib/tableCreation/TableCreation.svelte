<script lang="ts">
    import { tables } from '../dal/data'
    import { Pencil, Check, Trash2 } from 'lucide-svelte'
    import IconButton from '$lib/IconButton.svelte'

    import Input from '$lib/utils/Input.svelte'
    import { validateTableName } from './vlidators'
    import { removeTable, renameTable } from '$lib/dal/api'
    import SectionCols from './sections/SectionCols.svelte'

    export let tableName = ''

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

    function delTable(): void {
        removeTable(tableName)
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

        {#if !editingName}
            <div class="pad" />

            <IconButton
                extraClass="cross"
                on:input={delTable}
            >
                <Trash2 size={24} />
            </IconButton>
        {/if}
    </div>
    <SectionCols tableData={$tables[tableName]} />
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

    @mixin forceIcon($color, $cls) {
        :global(.#{$cls}) {
            --color-active: #{$color};
            --color-secondary: #{$color};
        }
    }

    .header {
        gap: 12px;
        align-items: center;

        h2 {
            font-size: $tableNameFS;
        }

        .pad {
            width: 100%;
            flex-grow: 1;
        }

        @include forceIcon($primary, 'edit');
        @include forceIcon($green-4, 'check');
        @include forceIcon($danger, 'cross');

        > :global(input) {
            font-size: $tableNameFS;
        }
    }
</style>
