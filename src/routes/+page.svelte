<script lang="ts">
	import { tables } from '$lib/data';
	import TableCreation from '$lib/tableCreation/TableCreation.svelte';
    import TableNode from '$lib/TableNode.svelte';
    import { Background, BackgroundVariant, Controls, MiniMap, SvelteFlow, type Node, type Edge } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/style.css';
	import { writable } from 'svelte/store';

    // Also set the scss var
    const BAR_DRAG_WIDTH = 8;

    let clientWidth = writable<number>(1920);
    let widthMade = false;

    let maxWidth = 0;
    let minWidth = 0;

    let curWidth = 0;

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

    function mouseMoveForDrag(clientX: number) {
        if (!dragging) {
            return
        }
        if (clientX >= minWidth && clientX <= maxWidth) {
            curWidth = clientX
        }
    }

    let dragging = false

    // We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position. This also makes it easier to update nodes in user land.
    const nodes = writable<Node[]>([
        {
            id: '2',
            type: 'table',
            data: { name: 'cool-table' },
            position: { x: 0, y: 150 }
        }
    ]);

    // same for edges
    const edges = writable<Edge[]>([]);
</script>

<svelte:window
    bind:innerWidth={$clientWidth}
    on:mouseup={() => dragging = false}
    on:mousemove={(e) => mouseMoveForDrag(e.clientX)}
/>

<header class="row">
    <h3>Reserved for Future Cool Shit:tm:</h3>
</header>

<div class="page-container row" style="--cursor:{dragging ? 'grabbing' : ''}">
    <div class="col sidebar" style="--width:{curWidth}px">
        {#each Object.keys($tables) as tab}
            <TableCreation tableName={tab} />
        {/each}
    </div>

    <div class="col resize-bar {dragging ? 'active' : ''}" role="presentation" on:mousedown={(e) => dragging = e.buttons === 1} />

    <div class="col draw-wrapper" style="--width:{$clientWidth - curWidth - BAR_DRAG_WIDTH}px">
        <SvelteFlow
            {nodes}
            {edges}
            attributionPosition="top-right"
            onlyRenderVisibleElements
            fitView
            nodeTypes={{
                table: TableNode
            }}
            colorMode={"dark"}
        >
            <Controls />
            <Background bgColor="#0d1117" variant={BackgroundVariant.Cross} />
            <MiniMap />
        </SvelteFlow>
    </div>
</div>

<style lang="scss">
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

        &:hover, &.active {
            background-color: $primary;
        }
    }

    .page-container {
        cursor: var(--cursor);
        height: calc(100dvh - $headerHeight);

        > * {
            height: 100%;
        }

        .sidebar {
            background-color: $gray-9;
            padding: 0.75rem;
            gap: 4px;
        }

        .sidebar, .draw-wrapper {
            width: var(--width);
        }
    }
</style>