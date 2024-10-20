<script lang="ts">
    import { type NodeProps, useInternalNode, useUpdateNodeInternals } from '@xyflow/svelte'
    import { indices, tables, multiColIndexExceptions } from '../dal/data'
    import TableColumn from './TableColumn.svelte'
    import TableIndex from './TableIndex.svelte'
    import TableNodeSection from './TableNodeSection.svelte'
    import type { Column } from '$lib/types'
    import { onMount } from 'svelte'

    type NodeData = {
        name: string
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type $$Props = NodeProps & { data: NodeData }
    export let data: NodeData
    export let selected = false
    export let width: number | undefined = undefined
    export let dragging = false
    export let positionAbsoluteX: number | undefined
    export let id: string

    let { name } = data

    $: multiColInd = ($indices[name] ?? [])
        .map((v, i) => ({ v, i }))
        .filter(({ v, i }) => {
            return v.colNames.length > 1 || $multiColIndexExceptions[name]?.has(i)
        })

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $$restProps

    const node = useInternalNode(id)
    const updateNode = useUpdateNodeInternals()

    let dragOpts:
        | {
              last: number
              left: boolean
          }
        | undefined
    let elmWrapper: HTMLDivElement | undefined

    function calculateMinWidth(_colNames: Column[]): number {
        const parent = elmWrapper?.firstChild?.firstChild
        if (!parent) return 200
        if (!parent.hasChildNodes()) return 200

        let maxes = {
            t: 0,
            n: 0
        }

        parent.childNodes.forEach((v) => {
            const e = v as Element
            const classes = e.classList
            if (!classes) return

            const nType: keyof typeof maxes | '' = classes.contains('col-type')
                ? 't'
                : classes.contains('col-name')
                  ? 'n'
                  : ''
            if (!nType) return

            const w = e.getBoundingClientRect().width
            if (w > maxes[nType]) {
                maxes[nType] = w
            }
        })

        // padding x2 + icon col + max name size + max type size + gap x2 + extra pad <3
        // 0.75 rem * 2 + 16px + max name + max type + 8px + 16px
        // ~27px + 32px + maxes
        // 49px + maxes
        return 49 + maxes.n + maxes.t
    }

    $: minWidth = calculateMinWidth($tables[name].cols)

    onMount(() => {
        minWidth = calculateMinWidth([])
    })

    function mouseDown(e: MouseEvent): void {
        if (e.currentTarget != e.target) return
        e.preventDefault()
        e.stopPropagation()

        const t = e.target as Element
        const rect = t.getBoundingClientRect()

        dragOpts = {
            last: e.clientX,
            left: rect.x + rect.width / 2 > e.clientX
        }
    }

    function mouseMove(e: MouseEvent): void {
        if (!dragOpts || !positionAbsoluteX) return

        let offset = e.clientX - dragOpts.last
        if (dragOpts.left) {
            offset = -offset
        }

        if (!width) {
            if (!elmWrapper) return
            const t = elmWrapper.getBoundingClientRect()
            width = t.width
        }

        const newWidth = width + offset
        if (newWidth < minWidth) {
            return
        }

        width += offset
        dragOpts.last = e.clientX

        if (dragOpts.left) {
            positionAbsoluteX -= offset
        }

        const n = $node

        if (n) {
            n.width = width
            n.internals.userNode.width = width

            if (dragOpts.left) {
                n.position.x -= offset
                n.internals.positionAbsolute.x = positionAbsoluteX
            }

            updateNode(id)
        }
    }
</script>

<svelte:window
    on:mouseup={(e) => {
        if (!dragOpts) return
        e.preventDefault()
        e.stopPropagation()
        dragOpts = undefined
    }}
    on:mousemove={mouseMove}
/>

<div
    bind:this={elmWrapper}
    class="node-wrapper maxxer {selected ? 'selected' : ''}"
    style="--node-width: {width && width >= minWidth ? width : minWidth}px"
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="resize" on:mousedown={mouseDown}>
        <div class="node maxxer {dragging ? 'dragging' : ''}">
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
</div>

<style lang="scss">
    $iconSize: 12px;
    $nodeBG: $gray-9;
    $nodeBG2: $gray-8;
    $nodePad: 0.5rem;

    .maxxer {
        height: 100%;
        width: 100%;
    }

    .node-wrapper {
        background-color: $nodeBG;

        padding: $nodePad 0;
        border-radius: 12.5px;

        border: $nodeBG 1px solid;
        transition: 0.2s border;

        width: var(--node-width, 'auto');

        &.selected {
            border: $primary 4px solid;
        }
    }

    .resize {
        padding: 0 calc($nodePad * 1.5);
        cursor: col-resize;
    }

    .node {
        display: grid;

        background-color: $nodeBG;

        gap: 6px 4px;
        grid-template-columns: calc($iconSize + 4px) 1fr min-content;
        cursor: grab;
    }

    .dragging {
        cursor: grabbing;
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
