<script lang="ts">
    import { inputHandlerFactory, type InputHandler } from '$lib/input'
    import { IndexType } from '$lib/types'
    import { createEventDispatcher } from 'svelte'
    import { fly } from 'svelte/transition'
    import IndexIcon from '$lib/IndexIcon.svelte'
    import BgCloser from '$lib/utils/BgCloser.svelte'

    type realIndexType = IndexType

    const icons: [string, realIndexType][] = [
        ['Not Indexed', IndexType.NONE],
        ['Indexed', IndexType.INDEX],
        ['Unique', IndexType.UNIQUE],
        ['Primary Key', IndexType.PRIMARY]
    ]

    export let curIndexType: realIndexType
    const dispatch = createEventDispatcher<{ input: realIndexType; close: void }>()

    const onInput = (v: realIndexType): InputHandler => {
        return inputHandlerFactory(() => dispatch('input', v))
    }
</script>

<BgCloser {dispatch} />

<div class="container row" in:fly={{ x: '1rem' }} out:fly={{ x: '1rem' }}>
    <div class="wrapper col">
        {#each icons as cfg}
            <div
                class="row index-type {curIndexType == cfg[1] ? 'active' : ''}"
                role="button"
                tabindex="0"
                on:keypress={onInput(cfg[1])}
                on:click={onInput(cfg[1])}
            >
                <IndexIcon active={curIndexType == cfg[1]} size={18} type={cfg[1]} />
                <h4>{cfg[0]}</h4>
            </div>
        {/each}
    </div>

    <div class="tip" />
</div>

<style lang="scss">
    $width: clamp(180px, 18dvw, 210px);

    $tipWidth: 1rem;
    $borderColor: $gray-7;

    $padTop: 0.25rem;
    $rowPadTop: 4px;
    $labelFontSize: 1rem;
    $labelCount: 4;

    $baseAllRowHeight: calc($padTop * 2 + $rowPadTop * $labelCount * 2);
    $height: max(
        7rem,
        calc($baseAllRowHeight + $labelFontSize * $labelCount),
        calc($baseAllRowHeight + 18px * $labelCount)
    );

    h4 {
        font-size: $labelFontSize;
        pointer-events: none;
    }

    .container {
        position: absolute;

        grid-row: 1;
        grid-column: -3;

        justify-self: left;
        left: calc(0px - 4px - $tipWidth - $width);
        z-index: 10;
    }

    .tip {
        align-self: center;

        border-top: $tipWidth solid transparent;
        border-bottom: $tipWidth solid transparent;
        border-left: $tipWidth solid $borderColor;
    }

    .wrapper {
        border-radius: 12px;

        background-color: $gray-9;
        padding: $padTop 0.5rem;

        justify-content: space-between;

        border: $borderColor 1px solid;

        width: $width;
        height: $height;
    }

    .index-type {
        padding: $rowPadTop 6px;
        align-items: center;
        justify-content: space-between;
        border-radius: 12px;
        cursor: pointer;

        &:hover,
        &:focus-visible {
            background: $gray-8;
        }
    }
</style>
