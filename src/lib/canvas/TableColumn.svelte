<script lang="ts">
    import { Handle, Position } from '@xyflow/svelte'
    import { indices } from '../dal/data'
    import { type Column, type Index } from '../types'
    import IndexIcon from '$lib/tableCreation/IndexIcon.svelte'
    import { ICON_SIZE } from '.'

    export let data: Column
    export let tableName: string

    $: typeName = (function (t, arrLevel) {
        let arr = ''
        for (let i = 0; i < arrLevel; i++) {
            arr += '[]'
        }

        return t + arr
    })(data.type, data.arrayLevel)

    $: index = (function (tableIndices: Index[] | null, n: string) {
        if (!tableIndices) return

        return tableIndices.find((ind) => ind.colNames.length == 1 && ind.colNames[0] == n)
    })($indices[tableName], data.name)
</script>

<div class="index">
    {#if index}
        <IndexIcon size={ICON_SIZE} type={index.type} active />
    {/if}
</div>
<div class="col-name">
    <p>
        {data.name}{#if data.nullable}<span class="dull">?</span>{/if}
    </p>
</div>
<div class="col-type">
    <p class="dull">{typeName}</p>
</div>

<Handle type="target" position={Position.Left} id="{tableName}.{data.name}" />
<Handle type="source" position={Position.Right} id="{tableName}.{data.name}" />

<style lang="scss">
    @use 'vars';

    p {
        font-size: vars.$font-size;
        word-break: keep-all;
        white-space: nowrap;
        white-space-collapse: discard;
        font-weight: 500;
    }

    div {
        align-self: center;
        justify-self: left;
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
