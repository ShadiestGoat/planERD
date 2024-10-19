<script lang="ts">
    import { tables, multiColIndexExceptions } from '$lib/dal/data'
    import { Trash2, Plus } from 'lucide-svelte'
    import IndexDropdown from './IndexDropdown.svelte'
    import IconButton from '$lib/IconButton.svelte'
    import { inputHandlerFactory } from '$lib/input'
    import { createEventDispatcher } from 'svelte'
    import type { IndexType } from '$lib/types'
    import IndexPopupWrapper from '../IndexPopupWrapper.svelte'

    // The index of the index we are editing
    export let indexIndex: number
    export let tableName: string
    export let dropdownID: number
    // Bug avoidance: specific binds dont crash <3
    export let curColNames: string[]
    export let indexType: IndexType

    $: allColNames = $tables[tableName].cols.map((c) => c.name)

    function exceptionWrap(h: () => void): () => void {
        return () => {
            if (!$multiColIndexExceptions[tableName]) {
                $multiColIndexExceptions[tableName] = new Set()
            }
            h()
            $multiColIndexExceptions[tableName] = $multiColIndexExceptions[tableName]
        }
    }

    const addException = exceptionWrap(() => $multiColIndexExceptions[tableName].add(indexIndex))
    const rmException = exceptionWrap(() => $multiColIndexExceptions[tableName].delete(indexIndex))

    function closeDropdown(): void {
        dropdownID = -1

        if (curColNames.length >= 2) {
            rmException()
        }
    }

    function toggleDropdown(): void {
        if (shouldShowDropdown) {
            closeDropdown()
        } else {
            addException()
            dropdownID = indexIndex
        }
    }

    const onDropdownInput = inputHandlerFactory(toggleDropdown)

    $: shouldShowDropdown = dropdownID == indexIndex
    const dispatch = createEventDispatcher<{
        delete: void
    }>()
</script>

<div class="row container">
    <IndexPopupWrapper
        direction="right"
        iconSize="1rem"
        id="mci-{indexIndex}"
        {indexType}
        allowSettingNone={false}
        on:setIndex={({ detail }) => {
            indexType = detail
        }}
    />

    <div
        class="wrapper row {curColNames.length == 0 ? 'min' : ''}"
        tabindex="0"
        role="button"
        on:click={onDropdownInput}
        on:keydown={onDropdownInput}
        aria-pressed={shouldShowDropdown}
    >
        {#if shouldShowDropdown}
            <IndexDropdown {allColNames} bind:indexCols={curColNames} on:close={closeDropdown} />
        {/if}

        {#each curColNames as col, i}
            <div class="row col-data">
                <p>{col}</p>
                <IconButton
                    extraClass="trash"
                    on:input={() => {
                        if (curColNames.length <= 2) {
                            addException()
                        }
                        curColNames.splice(i, 1)
                        curColNames = curColNames
                    }}
                >
                    <Trash2 size="0.8rem" />
                </IconButton>
            </div>
        {/each}
    </div>

    <div class="controls col">
        <IconButton extraClass="plus" on:input={toggleDropdown}>
            <Plus size="1rem" />
        </IconButton>
        <IconButton extraClass="trash" on:input={() => dispatch('delete')}>
            <Trash2 size="1rem" />
        </IconButton>
    </div>
</div>

<style lang="scss">
    @use '$lib/utils/multi_index' as ind;
    @use '$lib/utils/input';

    .container {
        position: relative;
        gap: 1rem;
        align-items: center;

        :global(.icon-btn) {
            padding: 6px;
        }

        @include input.forceIconColor($danger, 'trash');
    }

    .wrapper {
        cursor: pointer;
        transition: 0.5s;
        position: relative;
        align-items: center;

        @include ind.wrapper;

        &:focus-visible,
        &:hover {
            outline: $primary 1px solid;
        }

        &.min {
            align-self: stretch;
            margin: 0.5rem 0;
        }

        &.bad {
            outline: $danger 1px solid;
        }

        .pad {
            flex-grow: 1;
        }

        .col-data {
            gap: 4px;

            @include ind.col-data(0.8rem);
        }
    }

    .controls {
        @include input.forceIconColor($primary, 'plus');
    }
</style>
