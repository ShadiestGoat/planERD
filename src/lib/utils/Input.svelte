<script lang="ts">
    import { createEventDispatcher } from "svelte"


    export let extraClass = ""
    export let curValue = ""
    export let placeholder = ""
    export let valueIsGood = true

    export let isInputGood: ((v: string) => boolean) | undefined = undefined

    const dispatch = createEventDispatcher<{ input: string }>()
</script>

<input
    class="{valueIsGood ? '' : 'bad'} {extraClass}"
    {placeholder}
    type="text"
    bind:value={curValue}
    on:input={() => {
        if (isInputGood) {
            valueIsGood = isInputGood(curValue)
        }

        if (!valueIsGood) return
        dispatch('input', curValue)
    }}
/>

<style lang="scss">
    @use 'input';

    input {
        @include input.input;
    }
</style>