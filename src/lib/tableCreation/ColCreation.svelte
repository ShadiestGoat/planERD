<script lang="ts">
    import { GripVertical, Ghost, Trash2 } from 'lucide-svelte'
    import { createEventDispatcher } from 'svelte'

    import { allSQLTypes, tables } from '$lib/dal/data'
    import { IndexType } from '$lib/types'
    import type { Column, Index } from '$lib/types'

    import IndexIcon from './IndexIcon.svelte'
    import IndexPopup from './IndexPopup.svelte'
    import IconButton from '$lib/IconButton.svelte'
    import Input from '$lib/utils/Input.svelte'
    import { validateColName } from './vlidators'

    export let tableName: string

    export let singleIndex: Index | undefined

    export let colIndex: number
    export let indexPopup: number

    const dispatch = createEventDispatcher<{
        setName: string
        delete: void
        setIndex: IndexType
    }>()

    export let colNameValue: string

    function mkOtherColNames(cols: Column[], col: number): string[] {
        return [
            ...cols.slice(0, col),
            ...cols.slice(col + 1)
        ].map(v => v.name)
    }

    $: otherColNames = mkOtherColNames($tables[tableName].cols, colIndex)
</script>

<div class="col-data">
    <GripVertical size={18} color="white" />

    <Input
        placeholder="Column Name"
        curValue={colNameValue}
        isInputGood={validateColName(otherColNames)}
        on:input={({ detail }) => dispatch('setName', detail)}
    />

    <select bind:value={$tables[tableName].cols[colIndex].type}>
        {#each allSQLTypes as typeGroup}
            <optgroup label={typeGroup[0]}>
                {#each typeGroup[1] as t}
                    <option value={t.name}>{t.name}</option>
                {/each}
            </optgroup>
        {/each}
    </select>

    <!-- args -->
    <div />
    <div />

    <IconButton
        extraClass="nullable"
        bind:active={$tables[tableName].cols[colIndex].nullable}
        doToggle
    >
        <Ghost size={18} />
    </IconButton>

    {#if colIndex == indexPopup}
        <IndexPopup
            curIndexType={singleIndex ? singleIndex.type : IndexType.NONE}
            on:input={({ detail }) => {
                dispatch('setIndex', detail)
                indexPopup = -1
            }}
            on:close={() => indexPopup = -1}
        />
    {/if}

    <IconButton
        extraClass="ind"
        active={!!singleIndex}
        on:input={({ detail: e }) => {
            e.stopPropagation()

            if (indexPopup == colIndex) {
                indexPopup = -1
            } else {
                indexPopup = colIndex
            }
        }}
    >
        <IndexIcon
            size={18}
            active={!!singleIndex}
            type={singleIndex ? singleIndex.type : IndexType.NONE}
        />
    </IconButton>

    <IconButton extraClass="trash" active={false} on:input={() => dispatch('delete')}>
        <Trash2 size={18} class="trash" />
    </IconButton>
</div>

<style lang="scss">
    @use 'sass:list';
    @use '$lib/utils/input';

    .col-data {
        display: grid;
        position: relative;

        justify-items: center;
        align-items: center;
        gap: 4px;

        //                   draggable
        grid-template:
            1fr / 24px
            //                   col name, type, args (1), args (2)
            12ch 12ch 2ch 2ch
            // empty space
            1fr
            //                   nullable, index type, trash
            repeat(3, 26px);
    }

    $types: trash, special, nullable;

    .col-data {
        :global(.trash) {
            // trash is always disabled -- this forces it active.
            --color-active: #{$danger};
            --color-secondary: #{$danger};
        }

        @for $i from 1 through list.length($types) {
            $t: list.nth($types, $i);

            :global(.#{$t}) {
                grid-column: calc(-1 - $i);
            }
        }

        :global(.icon-btn) {
            width: 100%;
            height: 100%;
        }
    }

    select {
        @include input.input
    }
</style>
