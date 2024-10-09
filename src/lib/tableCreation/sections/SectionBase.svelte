<script lang="ts">
    import IconButton from "$lib/IconButton.svelte"
    import { Plus } from "lucide-svelte"
    import { createEventDispatcher } from "svelte"

    export let title: string

    const dispatch = createEventDispatcher<{ add: void }>()
</script>

<div class="col-container col">
    <div class="row sub-header">
        <h4>{title}</h4>

        <IconButton on:input={() => dispatch('add')} extraClass="header-btn" active={false} noColor>
            <Plus size={24} class="primary" />
        </IconButton>
    </div>

    <div class="col-wrapper col">
        <slot />
    </div>
</div>

<style lang="scss">
    .col-container {
        padding-left: 12px;

        &,
        .col-wrapper {
            gap: 12px;
        }
    }

    .col-wrapper {
        padding-left: 12px;
    }

    .sub-header {
        align-items: center;
        justify-content: space-between;
    }
</style>