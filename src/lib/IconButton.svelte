<script lang="ts">
	import { inputHandlerFactory } from "$lib/input";
	import { createEventDispatcher } from "svelte";


    const dispatch = createEventDispatcher<{ input: Element }>()

    export let active: boolean
    export let extraClass = ""
    export let doToggle = false

    const onInput = inputHandlerFactory((e) => {
        if (doToggle) {
            active = !active
        }
    
        dispatch('input', e.target as Element)
    })
</script>

<div class="wrapper col {extraClass} {active ? 'active' : ''}" role="button" tabindex="0" on:click={onInput} on:keypress={onInput}>
    <slot />
</div>

<style lang="scss">
    div {
        --color-active: #{$primary};
        --color-secondary: #{$secondary};

        --color: var(--color-secondary);
    }

    .active {
        --color: var(--color-active);
    }

    div {
        width: 100%;
        height: 100%;
        border-radius: 6px;
        justify-content: center;
        align-items: center;
        transition: 0.25s;
        cursor: pointer;

        &:hover, &:focus-visible, &.active {
            background: $gray-8;
        }

        &.active {
            outline: var(--color-active) 1px solid;
        }

        &:hover, &:focus-visible {
            outline: var(--color-secondary) 1px solid;
        }
    }

    div > :global(*) {
        color: var(--color);
        pointer-events: none;
    }
</style>