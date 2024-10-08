<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    export let extraClass = ''
    export let curValue = ''
    export let placeholder = ''
    export let valueIsGood = true
    export let autofocus = false

    export let isInputGood: ((v: string) => boolean) | undefined = undefined

    const dispatch = createEventDispatcher<{
        input: string
        submit: void
    }>()
</script>

<!-- svelte-ignore a11y-autofocus -->
<input
    class="{valueIsGood ? '' : 'bad'} {extraClass}"
    {placeholder}
    {autofocus}
    type="text"
    bind:value={curValue}
    on:input={() => {
        if (isInputGood) {
            valueIsGood = isInputGood(curValue)
        }

        if (!valueIsGood) return
        dispatch('input', curValue)
    }}
    on:keydown={(e) => {
        if (e.key != 'Enter') return

        dispatch('submit')
    }}
/>

<style lang="scss">
    @use 'input';

    input {
        @include input.input;
    }
</style>
