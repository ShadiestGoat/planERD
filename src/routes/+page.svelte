<script lang="ts">
    import { indices, tableOrder } from '$lib/dal/data'
    import { nodes, edges } from '$lib/dal/nodes'
    import TableCreation from '$lib/tableCreation/TableCreation.svelte'
    import TableNode from '$lib/canvas/TableNode.svelte'
    import {
        Background,
        BackgroundVariant,
        Controls,
        MiniMap,
        SvelteFlow,
        useStore
    } from '@xyflow/svelte'
    import '@xyflow/svelte/dist/style.css'
    import { writable } from 'svelte/store'
    import { Search, Plus } from 'lucide-svelte'
    import IconButton from '$lib/IconButton.svelte'
    import { addTableData, defaultTable } from '$lib/dal/api'
    import { IndexType } from '$lib/types'
    import { onMount } from 'svelte'
    import { loadData } from '$lib/dal/save'
    import { fuzzySearch } from '$lib/utils/search'
    import CustomEdge from '$lib/canvas/CustomEdge.svelte'

    // Also set the scss var
    const BAR_DRAG_WIDTH = 8

    let clientWidth = writable<number>(1920)
    let widthMade = false

    let maxWidth = 0
    let minWidth = 0

    let curWidth = 0

    const defaultWidthRatio = 0.35
    // total = 0.75rem + 12 * 2 + 12 * 2 + 12 + col-grid
    // col-grid = 24 + 12ch + 12ch + 2ch + 2ch + 3 * 26
    // col-grid = 102 + 28ch
    // 1rem ~= 15px
    // 1ch ~= 11px
    // total = 0.75 * 15 + 60 + 102 + 28 * 11
    // total = 481.25
    // total ~= 500
    const ABS_MIN_WIDTH = 500

    clientWidth.subscribe((newV) => {
        const shouldSetCurWidth = curWidth == maxWidth * defaultWidthRatio || !widthMade

        maxWidth = Math.floor(newV * 0.75)
        minWidth = Math.floor(newV * 0.1)
        if (minWidth < ABS_MIN_WIDTH) {
            minWidth = ABS_MIN_WIDTH
        }

        if (shouldSetCurWidth) {
            curWidth = maxWidth * defaultWidthRatio
        }

        if (curWidth > maxWidth) {
            curWidth = maxWidth
        } else if (curWidth < minWidth) {
            curWidth = minWidth
        }

        if (newV) {
            widthMade = true
        }
    })

    function mouseMoveForDrag(clientX: number): void {
        if (!dragging) {
            return
        }
        if (clientX >= minWidth && clientX <= maxWidth) {
            curWidth = clientX
        }
    }

    let dragging = false

    const { fitView: flowFitView } = useStore()

    onMount(async () => {
        loadData()

        flowFitView()
    })

    let tableSearchValue = ''

    $: visibleTables = fuzzySearch(tableSearchValue, $tableOrder)

    function addTable(): void {
        const t = defaultTable()

        const rightNode = $nodes.length
            ? [...$nodes].sort(
                  (a, b) =>
                      b.position.x +
                      (b.measured?.width ?? 0) -
                      (a.position.x + (a.measured?.width ?? 0))
              )[0]
            : null

        addTableData(
            t,
            rightNode
                ? {
                      x: rightNode.position.x + (rightNode.measured?.width ?? 0) + 40,
                      y: 0
                  }
                : undefined
        )

        setTimeout(() => {
            flowFitView()
        }, 2)

        $indices[t.name] = [
            {
                colNames: [t.cols[0].name],
                type: IndexType.PRIMARY
            }
        ]
    }
</script>

<svelte:window
    bind:innerWidth={$clientWidth}
    on:mouseup={() => (dragging = false)}
    on:mousemove={(e) => mouseMoveForDrag(e.clientX)}
/>

<header class="row">
    <h3>Reserved for Future Cool Shit:tm:</h3>
</header>

<div class="page-container row" style:--cursor={dragging ? 'grabbing' : ''}>
    <div class="col sidebar" style:--width="{curWidth}px">
        <div class="row search">
            <Search size="1.3rem" class="primary" />
            <input bind:value={tableSearchValue} placeholder="Search Tables" />
            <IconButton on:input={addTable}>
                <Plus class="icon" />
            </IconButton>
        </div>

        {#each visibleTables as name}
            <TableCreation tableName={name} />
        {/each}
    </div>

    <div
        class="col resize-bar"
        class:active={dragging}
        role="presentation"
        on:mousedown={(e) => (dragging = e.buttons === 1)}
    />

    <div class="col draw-wrapper" style:--width="{$clientWidth - curWidth - BAR_DRAG_WIDTH}px">
        <SvelteFlow
            {nodes}
            {edges}
            attributionPosition="top-right"
            onlyRenderVisibleElements
            fitView
            nodeTypes={{
                table: TableNode
            }}
            colorMode={'dark'}
            edgeTypes={{
                floater: CustomEdge
            }}
            defaultEdgeOptions={{
                type: 'floater'
            }}
        >
            <Controls />
            <Background bgColor="#0d1117" variant={BackgroundVariant.Cross} />
            <MiniMap />
        </SvelteFlow>
    </div>
</div>

<style lang="scss">
    @use '$lib/utils/input';

    $resizeBarWidth: 8px;
    $headerHeight: 5dvh;

    header {
        height: $headerHeight;
        justify-content: center;
        align-items: center;

        h3 {
            color: $primary;
        }
    }

    .resize-bar {
        // real devs use !important
        width: $resizeBarWidth !important;
        background-color: $gray-8;
        cursor: col-resize;
        transition: 0.35s;
        border: 0;

        &:hover,
        &.active {
            background-color: $primary;
        }
    }

    .sidebar {
        background-color: $gray-9;
        padding: 0.75rem;
        gap: 12px;
        overflow-y: scroll;
        padding-bottom: 10rem;
    }

    .sidebar,
    .draw-wrapper {
        width: var(--width);
    }

    .page-container {
        cursor: var(--cursor);
        height: calc(100dvh - $headerHeight);

        > * {
            height: 100%;
        }
    }

    .search {
        align-items: center;
        gap: 12px;

        $fs: 1.1rem;
        $iconSize: 1.3rem;

        input {
            @include input.input($gray-10);
            font-size: $fs;
        }

        :global(*) {
            --color: #{$primary};
            --color-secondary: #{$primary};
        }

        :global(.icon) {
            width: $iconSize;
            height: $iconSize;
        }
    }
</style>
