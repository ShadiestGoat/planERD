<script lang="ts">
    import { NodeResizer, type NodeProps } from '@xyflow/svelte'
    import { tables } from './data'
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

    const { name } = data
    $: tableData = $tables[name]

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $$restProps
</script>

<div class="node-wrapper maxxer">
    <NodeResizer isVisible={selected} minWidth={ICON_SIZE * 4 + 100} />

    <div class="node maxxer">
        <div class="header bg col">
            <h4>{name}</h4>
        </div>

        {#each tableData.cols as col, i}
            <div class="bg stupid-bg" style="--row: {i + 2}" />
            <TableColumn {col} tableName={name} row={i + 2} />
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

    .node-wrapper {
        background-color: $nodeBG;

        padding: 0.5rem;
        border-radius: 12.5px;
    }

    .bg {
        background-color: $nodeBG;
    }

    .stupid-bg {
        grid-row: var(--row);
        grid-column-start: 1;
        grid-column-end: -1;
    }

    .node {
        display: grid;

        background-color: $nodeBG2;

        gap: 1px;
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
