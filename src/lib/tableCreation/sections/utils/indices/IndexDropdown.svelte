<script lang="ts">
    import Separator from "$lib/utils/Separator.svelte"
    import Input from "$lib/utils/Input.svelte"
    import { createEventDispatcher } from "svelte"
    import BgCloser from "$lib/utils/BgCloser.svelte"

    export let allColNames: string[]

    // Bug avoidance - use the actual value instead of the full obj
    export let indexCols: string[]

    const dispatch = createEventDispatcher<{ close: void }>()

    function toggleIndexColPresent(col: string): void {
        const i = indexCols.indexOf(col)

        if (i == -1) {
            indexCols = [...indexCols, col]
        } else {
            indexCols.splice(i, 1)
            indexCols = indexCols
        }
    }
</script>

<BgCloser {dispatch} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="wrapper" on:click={(e) => e.stopPropagation()}>
    <!-- TODO: Use this input to filter visible columns -->
    <Input />
    <Separator />

    <div class="col all-cols">
        {#each allColNames as col}
            <label class="col-data row">
                <input type="checkbox" checked={indexCols.includes(col)} on:change={() => toggleIndexColPresent(col)} />
                <p>{col}</p>
            </label>
        {/each}
    </div>
</div>

<style lang="scss">
    @use '$lib/utils/multi_index' as ind;

    label {
        cursor: pointer;
    }

    .all-cols {
        gap: 6px;
        padding: 6px;
    }

    .col-data {
        $fs: 1rem;
        $check-size: calc($fs * 0.8);
        $inner-check-size: calc($check-size * 0.4);

        gap: 4px;
        font-size: $fs;
        color: $primary;
        align-items: center;

        p {
            font-size: inherit;
            color: inherit;
        }

        input {
            display: grid;
            place-content: center;
            appearance: none;
            margin: 0;
            color: inherit;
            width:  $check-size;
            height: $check-size;

            border: 2px solid currentColor;
            border-radius: 6px;

            &::before {
                content: '';
                display: block;
                width: $inner-check-size;
                height: $inner-check-size;
                transform: scale(0);
                transition: 0.2s transform;
                background: $primary;
                border-radius: 99px;
            }

            &:checked::before {
                transform: scale(1);
            }
        }
    }


    .wrapper {
        width: calc(100% - ind.$wrapperPadding * 2);
        position: absolute;
        background: $gray-9;
        border-radius: 12.5px;
        top: calc(100% + 3px);
        z-index: 99;
        border: $gray-8 2px solid;
    }
</style>