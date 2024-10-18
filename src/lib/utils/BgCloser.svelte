<script lang="ts">
    import { type EventDispatcher } from "svelte"


    let debounce = true
    setTimeout(() => {
        debounce = false
    }, 2)

    export let dispatch: EventDispatcher<{ close: void}>
</script>

<svelte:window
    on:click={(e) => {
        if (debounce) return

        e.preventDefault()
        e.stopPropagation()
        dispatch('close')
    }}
/>
