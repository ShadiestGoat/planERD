<script lang="ts">
	import { inputHandlerFactory } from "$lib/input";
	import { createEventDispatcher } from "svelte";


    const dispatch = createEventDispatcher<{ input: Element }>()

    export let cls: "nullable" | "special" | "trash"
    export let active: boolean

    const onInput = inputHandlerFactory((e) => dispatch('input', e.target as Element))
</script>

<div class="wrapper col {cls} {active ? 'active' : ''}" role="button" tabindex="0" on:click={onInput} on:keypress={onInput}>
    <slot />
</div>

<style lang="scss">
    @use "sass:list";

    $types: trash, special, nullable;

    @for $i from 1 through list.length($types) {
        $t: list.nth($types, $i);

        .#{$t} {
            grid-column: calc(-1 - $i);
        }
    }

    div {
        --color-active: #{$primary};
        --color-secondary: #{$secondary};

        --color: var(--color-secondary);
    }

    .trash {
        // trash is always disabled -- make it active always
        --color-active: #{$danger};
        --color-secondary: #{$danger};
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