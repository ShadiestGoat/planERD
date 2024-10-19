<script lang="ts">
    import { NodeResizer, type NodeProps } from '@xyflow/svelte'
    import { indices, tables, multiColIndexExceptions } from '../dal/data'
    import TableColumn from './TableColumn.svelte'
    import TableIndex from './TableIndex.svelte'
    import TableNodeSection from './TableNodeSection.svelte'

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

    $: multiColInd = ($indices[name] ?? [])
        .map((v, i) => ({ v, i }))
        .filter(({ v, i }) => {
            return v.colNames.length > 1 || $multiColIndexExceptions[name]?.has(i)
        })

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $$restProps
</script>

<div class="node-wrapper maxxer">
    <NodeResizer isVisible={selected} minWidth={ICON_SIZE * 4 + 100} />

    <div class="node maxxer">
        <div class="header col">
            <h4>{name}</h4>
        </div>

        <TableNodeSection
            data={$tables[name].cols}
            restOfTheData={{ tableName: name }}
            comp={TableColumn}
        />
        <TableNodeSection
            data={multiColInd}
            comp={TableIndex}
            restOfTheData={{ tableName: name }}
        />
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

    .node {
        display: grid;

        background-color: $nodeBG;

        gap: 6px 4px;
        grid-template-columns: calc($iconSize + 4px) 1fr min-content;
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
