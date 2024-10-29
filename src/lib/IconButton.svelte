<script lang="ts">
    import { type AnyInputEvent, inputAction } from '$lib/input'
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher<{ input: AnyInputEvent & { target: Element } }>()

    export let active = false
    export let extraClass = ''
    export let doToggle = false
    export let noColor = false
    export let disabled = false

    function onInput(e: AnyInputEvent): void {
        if (doToggle) {
            active = !active
        }

        e.stopPropagation()
        dispatch('input', e as AnyInputEvent & { target: Element })
    }
</script>

<div
    aria-disabled={disabled}
    class="wrapper col icon-btn {extraClass}"
    class:active
    class:color={!noColor}
    role="button"
    tabindex="0"
    use:inputAction={onInput}
>
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
        border-radius: 6px;
        justify-content: center;
        align-items: center;
        transition: 0.25s;
        padding: 2px;
        cursor: pointer;

        &[aria-disabled='true'] {
            cursor: not-allowed;
            --color: #{$gray-6};
        }

        &:not([aria-disabled='true']) {
            &:hover,
            &:focus-visible,
            &.active {
                background: $gray-8;
            }

            &.active {
                outline: var(--color-active) 1px solid;
            }

            &:hover,
            &:focus-visible {
                outline: var(--color-secondary) 1px solid;
            }
        }
    }

    div > :global(*) {
        pointer-events: none;
        transition: 0.25s;
    }

    .color > :global(*) {
        color: var(--color);
    }
</style>
