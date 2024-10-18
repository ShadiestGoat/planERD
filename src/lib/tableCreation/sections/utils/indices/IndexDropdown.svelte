<script lang="ts">
    import Separator from "$lib/utils/Separator.svelte"
    import Input from "$lib/utils/Input.svelte"
    import { createEventDispatcher } from "svelte"
    import BgCloser from "$lib/utils/BgCloser.svelte"

    export let allColNames: string[]

    // Bug avoidance - use the actual value instead of the full obj
    export let indexCols: string[]

    const dispatch = createEventDispatcher<{ close: void }>()
</script>

<BgCloser {dispatch} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="wrapper" on:click={(e) => e.stopPropagation()}>
    <Input />
    <Separator />

    {#each allColNames as col}
        <div class="col-data row">
            <input type="checkbox" />
            <p>{col}</p>
        </div>
    {/each}
</div>

<style lang="scss">
    @use '$lib/utils/multi_index' as ind;

    .wrapper {
        width: calc(100% - ind.$wrapperPadding * 2);
        position: absolute;
        background: $gray-9;
        border-radius: 12.5px;
        top: calc(100% + 3px);
        z-index: 99;
        border: $gray-8 2px solid;
    }
</style>