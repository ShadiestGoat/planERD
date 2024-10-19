<script lang="ts">
    import { inputHandlerFactory, type InputHandler } from '$lib/input'
    import { IndexType } from '$lib/types'
    import { createEventDispatcher } from 'svelte'
    import { fly } from 'svelte/transition'
    import IndexIcon from '$lib/IndexIcon.svelte'
    import BgCloser from '$lib/utils/BgCloser.svelte'

    const icons: [string, IndexType][] = [
        ['Not Indexed', IndexType.NONE],
        ['Indexed', IndexType.INDEX],
        ['Unique', IndexType.UNIQUE],
        ['Primary Key', IndexType.PRIMARY]
    ]

    export let curIndexType: IndexType
    export let direction: 'left' | 'right'
    export let allowSettingNone = false

    $: flyAmt = (direction == 'right' ? '-' : '') + '1rem'
    $: visibleIcons = allowSettingNone ? icons : icons.slice(1)

    const dispatch = createEventDispatcher<{ input: IndexType; close: void }>()

    const onInput = (v: IndexType): InputHandler => {
        return inputHandlerFactory(() => dispatch('input', v))
    }
</script>

<BgCloser {dispatch} />

<div
    class="container row {direction}"
    style="--label-count: {visibleIcons.length}"
    in:fly={{ x: flyAmt }}
    out:fly={{ x: flyAmt }}
>
    {#if direction == 'right'}
        <div class="tip-right" />
    {/if}

    <div class="wrapper col">
        {#each visibleIcons as cfg}
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

    {#if direction == 'left'}
        <div class="tip-left" />
    {/if}
</div>

<style lang="scss">
    $width: clamp(180px, 18dvw, 210px);

    $tipWidth: 1rem;
    $borderColor: $gray-7;

    $padTop: 4px;
    $rowPadTop: 4px;
    $labelFontSize: 1rem;

    @function totalHeight($fs) {
        $base: calc($padTop * 2);
        $perRowHeight: calc($rowPadTop * 2 + $fs * $lineHeightMult);

        @return calc($base + $perRowHeight * var(--label-count));
    }

    $height: max(totalHeight($labelFontSize), totalHeight($maxRemSize));

    $baseOffset: -4px;
    $offsetOffset: calc($tipWidth + $width);

    h4 {
        font-size: $labelFontSize;
        pointer-events: none;
    }

    .container {
        position: absolute;

        grid-row: 1;
        grid-column: -3;

        justify-self: left;
        z-index: 10;
    }

    .left {
        left: calc($baseOffset - $offsetOffset);
    }

    .right {
        right: calc($baseOffset + $offsetOffset);
    }

    .tip-right {
        align-self: center;

        border-top: $tipWidth solid transparent;
        border-bottom: $tipWidth solid transparent;
        border-right: $tipWidth solid $borderColor;
    }

    .tip-left {
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
