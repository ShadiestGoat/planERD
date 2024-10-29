<svelte:options immutable />

<script lang="ts">
    import {
        getBezierPath,
        useInternalNode,
        type EdgeProps,
        type InternalNode,
        Position
    } from '@xyflow/svelte'
    import { SIZE as MARKER_SIZE } from './markers'
    import { ColRelationType } from '$lib/types'

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type $$Props = EdgeProps

    export let source: EdgeProps['source']
    export let target: EdgeProps['target']
    export let sourceHandleId: EdgeProps['sourceHandleId'] = ''
    export let targetHandleId: EdgeProps['targetHandleId'] = ''
    export let markerEnd: EdgeProps['markerEnd'] = undefined
    export let markerStart: EdgeProps['markerStart'] = undefined
    export let id: EdgeProps['id']
    export let selected: EdgeProps['selected'] = false

    const NO_RENDER_ID = `m-${ColRelationType.TO_ONE}`

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $$restProps

    $: sourceNode = useInternalNode(source)
    $: targetNode = useInternalNode(target)

    function inBetween(v: number, min: number, max: number): boolean {
        if (max < 0) {
            v -= min
            max -= min
            min -= min
        }

        return v > min && v < max
    }

    function figureOutXs(aMin: number, aMax: number, bMin: number, bMax: number): [number, number] {
        if (inBetween(aMin, bMin, bMax) || inBetween(bMin, aMin, aMax)) {
            const v = Math.abs(aMin - bMin) < Math.abs(aMax - bMax)

            return v ? [aMin, bMin] : [aMax, bMax]
        }

        if (aMin > bMax) return [aMin, bMax]

        return [aMax, bMin]
    }

    let sourceGoingLeft = true
    let targetGoingRight = true

    function mkPath(s?: InternalNode, t?: InternalNode): string | undefined {
        if (!s || !t) return undefined
        if (!sourceHandleId || !targetHandleId) return undefined
        if (!s.internals.handleBounds?.target || !t.internals.handleBounds?.target) return undefined

        const sMin = s.position.x
        const sMax = s.position.x + (s.measured.width ?? 0)

        const tMin = t.position.x
        const tMax = t.position.x + (t.measured.width ?? 0)

        const [sourceX, targetX] = figureOutXs(sMin, sMax, tMin, tMax)

        // The target is at full height, which is all we really need anyways
        const sourceTHandle = s.internals.handleBounds.target.find((v) =>
            v.id?.startsWith(sourceHandleId.slice(0, -2))
        )
        if (!sourceTHandle) return undefined
        const targetHandle = t.internals.handleBounds.target.find((v) => v.id == targetHandleId)
        if (!targetHandle) return undefined

        sourceGoingLeft = sourceX == sMin
        targetGoingRight = targetX == tMin

        let curveSourceX = sourceX
        let curveTargetX = targetX

        if (markerEnd != NO_RENDER_ID) {
            curveTargetX += MARKER_SIZE * (targetGoingRight ? -1 : 1)
        }

        if (markerStart != NO_RENDER_ID) {
            curveSourceX += MARKER_SIZE * (sourceGoingLeft ? -1 : 1)
        }

        const sourceY = s.position.y + sourceTHandle.y + sourceTHandle.height / 2
        const targetY = t.position.y + targetHandle.y + targetHandle.height / 2

        const [curvePath] = getBezierPath({
            sourceX: curveSourceX,
            sourceY,
            targetX: curveTargetX,
            targetY,
            sourcePosition: sourceGoingLeft ? Position.Left : Position.Right,
            targetPosition: targetGoingRight ? Position.Left : Position.Right,
            curvature: 1
        })
        return curvePath
    }

    $: edgePath = mkPath($sourceNode, $targetNode)
</script>

<path {id} marker-end={markerEnd} marker-start={markerStart} d={edgePath} class:selected />

<style lang="scss">
    path {
        stroke: $primary;
        stroke-width: 3px;
        fill: none;

        transition: stroke-width 0.5s;
    }

    .selected {
        stroke-width: 5px;
    }
</style>
