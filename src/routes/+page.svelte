<script lang="ts">
    import { indices, relations, tableOrder } from '$lib/dal/data'
    import { nodes, edges } from '$lib/dal/nodes'
    import TableCreation from '$lib/tableCreation/TableCreation.svelte'
    import TableNode from '$lib/canvas/TableNode.svelte'
    import {
        Background,
        BackgroundVariant,
        Controls,
        MiniMap,
        SvelteFlow,
        useStore,
        type Node,
        type Edge,
        useUpdateNodeInternals
    } from '@xyflow/svelte'
    import '@xyflow/svelte/dist/style.css'
    import { writable } from 'svelte/store'
    import { Search, Plus } from 'lucide-svelte'
    import IconButton from '$lib/IconButton.svelte'
    import { APITable } from '$lib/dal/api'
    import { IndexType } from '$lib/types'
    import { onMount } from 'svelte'
    import { loadData } from '$lib/dal/save'
    import { fuzzySearch } from '$lib/utils/search'
    import CustomEdge from '$lib/canvas/CustomEdge.svelte'
    import Markers from '$lib/canvas/markers/Markers.svelte'
    import { sidebarTab, SidebarTabs } from '$lib/dal/tmpData'
    import { inputAction } from '$lib/input'

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

    const updateNodes = useUpdateNodeInternals()
    const tableAPI = new APITable(updateNodes)

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

        updateNodes($tableOrder)
        flowFitView()
    })

    let tableSearchValue = ''

    $: visibleTables = fuzzySearch(tableSearchValue, $tableOrder)

    function addTable(): void {
        const t = APITable.fullData(APITable.defaultName($tableOrder))

        const rightNode = $nodes.length
            ? [...$nodes].sort(
                  (a, b) =>
                      b.position.x +
                      (b.measured?.width ?? 0) -
                      (a.position.x + (a.measured?.width ?? 0))
              )[0]
            : null

        tableAPI.createRaw(t, {
            x: rightNode
                ? rightNode.position.x + (rightNode.width ?? rightNode.measured?.width ?? 0) + 60
                : 0,
            y: 0
        })

        $indices[t.name] = [
            {
                colNames: [t.cols[0].name],
                type: IndexType.PRIMARY
            }
        ]

        setTimeout(() => {
            flowFitView()
        }, 5)
    }

    function onDelete({ nodes, edges }: { nodes: Node[]; edges: Edge[] }): void {
        const ids = nodes.map((v) => v.id)

        // Edges & Relations get deleted via other means
        nodes.forEach((v) => {
            tableAPI.delete(v.id)
        })

        edges.forEach((v) => {
            if (!v.sourceHandle || !v.targetHandle) return
            if (ids.includes(v.source)) return
            if (ids.includes(v.target)) return

            const rmSet = new Set([v.sourceHandle.slice(0, -3), v.targetHandle.slice(0, -3)])
            $relations = $relations.filter((r) => {
                return new Set([r.from, r.to]).symmetricDifference(rmSet).size != 0
            })
        })
    }

    const tabConfig: [SidebarTabs, string][] = [
        [SidebarTabs.TABLES, 'Tables'],
        [SidebarTabs.RELATIONS, 'Relations'],
        [SidebarTabs.ENUMS, 'Enums']
    ]

    let tabScaling = false
    function onTabChange(c: SidebarTabs): () => void {
        return () => {
            $sidebarTab = c
            tabScaling = true

            setTimeout(() => {
                tabScaling = false
            }, 250)
        }
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
        <div class="tab-wrapper">
            <div class="row selection" style:--col={$sidebarTab} class:scaling={tabScaling} />

            {#each tabConfig as t, i}
                <div
                    class="row tab"
                    style:--col={i + 1}
                    role="button"
                    tabindex="0"
                    use:inputAction={onTabChange(t[0])}
                >
                    <h4>{t[1]}</h4>
                </div>
            {/each}
        </div>

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
            ondelete={onDelete}
        >
            <Controls />
            <Background bgColor="#0d1117" variant={BackgroundVariant.Cross} />
            <Markers />
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

    .tab-wrapper {
        width: 100%;
        display: grid;
        grid-template: 1fr / repeat(3, 1fr);
        padding: 0.5rem;
        background: $gray-10;
        border-radius: 12px;

        > div {
            padding: 0.25rem 0;
            justify-content: center;
            border-radius: 12px;
            grid-row: 1;
            position: relative;
        }

        .tab {
            cursor: pointer;
            width: 100%;
            grid-column: var(--col);
            z-index: 1;
        }

        .selection {
            background: $secondary;
            grid-column-start: 1;
            grid-column-end: -1;
            transition: 0.35s;
            width: calc(100% / 3);
            transform: translateX(calc(100% * var(--col)));
            z-index: 0;
        }

        .scaling {
            transform: translateX(calc(100% * var(--col))) scaleX(1.25);
        }
    }
</style>
