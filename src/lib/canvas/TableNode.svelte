<script lang="ts">
    import { NodeResizer, type NodeProps } from '@xyflow/svelte'
    import { tables } from '../dal/data'
    import TableColumn from './TableColumn.svelte'

    // Also change in sass
    const ICON_SIZE = 12

    type NodeData = {
        name: string
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type $$Props = NodeProps & { data: NodeData }
    export let data: NodeData
    export let selected = false

    let { name } = data

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $$restProps
</script>

<div class="node-wrapper maxxer">
    <NodeResizer isVisible={selected} minWidth={ICON_SIZE * 4 + 100} />

    <div class="node maxxer">
        <div class="header col">
            <h4>{name}</h4>
        </div>

        <hr class="separator thick" />

        {#each $tables[name].cols as col, i}
            <TableColumn {col} tableName={name} />

            {#if $tables[name].cols.length - 1 != i}
                <hr class="separator" />
            {/if}
        {/each}
    </div>
</div>

<style lang="scss">
    $iconSize: 12px;
    $nodeBG: $gray-9;
    $nodeBG2: $gray-8;

    .maxxer {
        height: 100%;
        width: 100%;
    }

    .separator {
        height: 2px;
        padding: 0;
        margin: 0;
        border: 0;
        background-color: $nodeBG2;
        width: 100%;
        grid-column-start: 1;
        grid-column-end: -1;
        border-radius: 25px;

        &.thick {
            height: 4px;
        }
    }

    .node-wrapper {
        background-color: $nodeBG;

        padding: 0.5rem;
        border-radius: 12.5px;
    }

    .node {
        display: grid;

        background-color: $nodeBG;

        gap: 1px 4px;
        grid-template-columns: calc($iconSize + 4px) 1fr min-content;

        > :global(*) {
            padding-top: 4px;
            padding-bottom: 4px;
        }
    }

    .header {
        grid-column-start: 1;
        grid-column-end: -1;

        align-items: center;
        justify-content: center;

        > * {
            color: $primary;
        }
    }
</style>
