<script lang="ts">
    import { ColRelationType } from '$lib/types'
    import { SIZE } from '.'
    import CrowsFoot from './CrowsFoot.svelte'
</script>

<svg class="svg">
    <defs>
        <marker
            id="m-{ColRelationType.TO_MANY}"
            viewBox="0 0 {SIZE} {SIZE}"
            markerHeight={SIZE / 2}
            markerWidth={SIZE / 2}
            refX={1}
            refY={SIZE / 2}
            orient="auto-start-reverse"
        >
            <CrowsFoot />
        </marker>
    </defs>
</svg>

<style lang="scss">
    .svg {
        position: absolute;
        top: 0;
        left: 0;
    }
</style>
