<script lang="ts">
    import { Handle, Position } from '@xyflow/svelte'
    import { indices } from '../dal/data'
    import { IndexType, type Column, type Index } from '../types'
    import { KeyRound, Snowflake, Bookmark } from 'lucide-svelte'

    const ICON_SIZE = 12

    export let col: Column
    export let tableName: string
    export let row: number

    $: typeName = (function (t, arrLevel) {
        let arr = ''
        for (let i = 0; i < arrLevel; i++) {
            arr += '[]'
        }

        return t + arr
    })(col.type, col.arrayLevel)

    $: index = (function (tableIndices: Index[] | null, n: string) {
        if (!tableIndices) return

        return tableIndices.find((ind) => ind.colNames.length == 1 && ind.colNames[0] == n)
    })($indices[tableName], col.name)
</script>

<div class="index" style="--row: {row}">
    {#if index}
        {#if index.type == IndexType.PRIMARY}
            <KeyRound size={ICON_SIZE} />
        {:else if index.type == IndexType.UNIQUE}
            <Snowflake size={ICON_SIZE} />
        {:else}
            <Bookmark size={ICON_SIZE} />
        {/if}
    {/if}
</div>
<div class="col-name" style="--row: {row}">
    <p>
        {col.name}{#if col.nullable}<span class="dull">?</span>{/if}
    </p>
</div>
<div class="col-type" style="--row: {row}">
    <p class="dull">{typeName}</p>
</div>

<Handle type="target" position={Position.Left} id="{tableName}.{col.name}" />
<Handle type="source" position={Position.Right} id="{tableName}.{col.name}" />

<style lang="scss">
    p {
        font-size: 0.9rem;
        word-break: keep-all;
        white-space: nowrap;
        white-space-collapse: discard;
        font-weight: 500;
    }

    div {
        align-self: center;
        justify-self: left;
        grid-row: var(--row);
    }

    .index {
        justify-self: center;
        grid-column: 1;

        & > :global(*) {
            color: $primary;
        }
    }

    .col-name {
        grid-column: 2;

        > p {
            color: $primary;
        }
    }

    .col-type {
        grid-column: 3;
    }

    .dull {
        color: $secondary;
    }
</style>
