<script lang="ts">
    import { SIZE } from '.'

    const OFFSET = 2
    const LEFT = 0
    const RIGHT = SIZE
    const BASE = `M${LEFT} ${SIZE / 2}`
</script>

<path
    d="{BASE} L{RIGHT} {SIZE - OFFSET} {BASE} L{RIGHT} {OFFSET} {BASE} L{RIGHT} {SIZE / 2}"
    stroke="context-stroke"
    stroke-linecap="round"
    stroke-width="1.5"
/>
