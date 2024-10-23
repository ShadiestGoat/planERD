<script lang="ts">
    import { indices, multiColIndexExceptions, relations, tables } from '../dal/data'
    import { type Column, type Index } from '../types'
    import IndexIcon from '$lib/IndexIcon.svelte'
    import { ICON_SIZE } from '.'
    import {
        Handle,
        Position,
        useConnection,
        type Connection,
        type HandleProps
    } from '@xyflow/svelte'
    import { addRelation } from '$lib/dal/api'

    export let data: Column
    export let tableName: string
    export let sectionIndex: number

    $: typeName = (function (t, arrLevel) {
        let arr = ''
        for (let i = 0; i < arrLevel; i++) {
            arr += '[]'
        }

        return t + arr
    })(data.type, data.arrayLevel)

    $: index = (function (tableIndices: Index[] | null, n: string, exceptions?: Set<number>) {
        if (!tableIndices) return

        return tableIndices.find(
            (ind, i) => ind.colNames.length == 1 && ind.colNames[0] == n && !exceptions?.has(i)
        )
    })($indices[tableName], data.name, $multiColIndexExceptions[tableName])

    $: row = (sectionIndex + 1) * 2 + 1

    const connection = useConnection()
    const handleID = `${tableName} ${data.name}`

    $: isTarget = $connection.toHandle?.id?.startsWith(handleID + ' ')
    $: isValid =
        $connection.inProgress &&
        $connection.fromNode?.id != tableName &&
        isLegalType(
            $connection.fromNode.id,
            ($connection.fromHandle.id?.split(' ') ?? ['', ''])[1],
            data.type
        )

    function isLegalType(sourceTable: string, sourceColName: string, curColType: string): boolean {
        const sourceCol = $tables[sourceTable].cols.find((v) => v.name == sourceColName)
        if (!sourceCol) return false

        return sourceCol.type == curColType
    }

    $: shouldDisplayTLeft = !$connection.inProgress || $connection.from.x <= $connection.to.x
    $: shouldDisplayTRight = !$connection.inProgress || $connection.from.x > $connection.to.x

    function onConnect(e: Connection[]): void {
        const c = e[0]
        if (!c.sourceHandle || !c.targetHandle) return

        addRelation(c.sourceHandle.slice(0, -3), c.targetHandle.slice(0, -3))
    }

    // True TS master
    function isTrueValid(
        e: Parameters<Exclude<HandleProps['isValidConnection'], undefined>>['0']
    ): boolean {
        if (e.source == e.target) return false

        const source = e.sourceHandle?.slice(0, -3)
        const dist = e.targetHandle?.slice(0, -3)
        if (!source || !dist) return false

        const [dTable, dCol] = dist.split(' ')
        if (!isLegalType(dTable, dCol, data.type)) return false

        const curSet = new Set([source, dist])
        for (const r of $relations) {
            const rSet = new Set([r.from, r.to])

            if (rSet.symmetricDifference(curSet).size == 0) return false
        }

        return true
    }
</script>

<div
    class="base max-row true-bg"
    class:is-target={isTarget}
    class:is-valid={isValid}
    style:--row={row}
/>

<div class="base max-row bg-handle row" style:--row={row}>
    {#if !!shouldDisplayTLeft}
        <Handle
            class="dropoff handle left"
            type="target"
            position={Position.Left}
            id="{handleID} tl"
            isConnectable={$connection.inProgress}
            onconnect={onConnect}
        />
    {/if}
    {#if !!shouldDisplayTRight}
        <Handle
            class="dropoff handle right"
            type="target"
            position={Position.Right}
            id="{handleID} tr"
            isConnectable={$connection.inProgress}
            onconnect={onConnect}
        />
    {/if}

    {#if !$connection.inProgress || $connection.fromHandle?.id?.startsWith(handleID + ' ')}
        <Handle
            class="handle source left"
            type="source"
            position={Position.Left}
            id="{handleID} sl"
            isValidConnection={isTrueValid}
        />
        <Handle
            class="handle source right"
            type="source"
            position={Position.Right}
            id="{handleID} sr"
            isValidConnection={isTrueValid}
        />
    {/if}
</div>

<div class="base index-icon-wrapper" style:--row={row}>
    {#if index}
        <IndexIcon size={ICON_SIZE} type={index.type} active />
    {/if}
</div>
<div class="base col-name" style:--row={row}>
    <p>
        {data.name}{#if data.nullable}<span class="dull">?</span>{/if}
    </p>
</div>
<div class="base col-type" style:--row={row}>
    <p class="dull">{typeName}</p>
</div>

<style lang="scss">
    @use 'vars';

    $base-handle-offset: calc(vars.$node-h-pad * -1);
    $handle-offset: calc($base-handle-offset - var(--border-size, 0px) * 0.5);

    .base {
        grid-row: var(--row);
        z-index: 1;
    }

    .max-row {
        width: 100%;
        height: 100%;
        grid-column-start: 1;
        grid-column-end: -1;
    }

    .bg-handle {
        position: relative;
        z-index: 2;

        :global(.handle) {
            border: none;
            background: none;
        }

        :global(.dropoff) {
            width: 50%;
            height: 100%;

            transform: none;
            top: 0;
            border-radius: 0;

            flex-grow: 2;
            position: relative;
        }

        :global(.source) {
            width: 0.6rem;
            height: 0.6rem;
            background: $primary;
        }

        :global(.source.left) {
            left: $handle-offset;
        }

        :global(.source.right) {
            right: $handle-offset;
        }
    }

    .true-bg {
        $extraWidth: vars.$node-h-pad;

        transition: 0.2s;
        z-index: 0;
        width: calc(100% + $extraWidth);
        transform: translateX(calc($extraWidth * -0.5));
        border-radius: 6px;

        &.is-valid {
            background: $gray-8;
        }

        &.is-valid.is-target {
            background: $gray-7;
        }
    }

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
        // Hack? Yes.
        // Do I care? No.
        padding: 4px 0;
    }

    .dull {
        color: $secondary;
    }
</style>
