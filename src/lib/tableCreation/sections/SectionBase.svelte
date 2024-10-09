<script lang="ts">
    import IconButton from '$lib/IconButton.svelte'
    import { Plus } from 'lucide-svelte'
    import { createEventDispatcher } from 'svelte'

    export let title: string
    export let disableAdd = false

    const dispatch = createEventDispatcher<{ add: void }>()
</script>

<div class="col-container col">
    <div class="row sub-header">
        <h4>{title}</h4>

        <IconButton
            disabled={disableAdd}
            on:input={() => dispatch('add')}
            extraClass="plus header-btn"
            active={false}
        >
            <Plus size={24} />
        </IconButton>
    </div>

    <div class="col-wrapper col">
        <slot />
    </div>
</div>

<style lang="scss">
    @use '$lib/utils/input';

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

        @include input.forceIconColor($primary, 'plus');
    }
</style>
