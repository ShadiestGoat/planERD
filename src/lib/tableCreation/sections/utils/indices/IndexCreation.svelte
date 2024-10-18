<script lang="ts">
    import { tables } from "$lib/dal/data"
    import { Trash2, Plus } from "lucide-svelte"
    import IndexDropdown from "./IndexDropdown.svelte"
    import IconButton from "$lib/IconButton.svelte"
    import { inputHandlerFactory } from "$lib/input"
    import { createEventDispatcher } from "svelte"

    // The index of the index we are editing
    export let indexIndex: number
    export let tableName: string
    export let dropdownID: number
    export let curColNames: string[]

    $: allColNames = $tables[tableName].cols.map(c => c.name)

    function closeDropdown(): void {
        dropdownID = -1
        dispatch('setException', false)
    }

    function toggleDropdown(): void  {
        if (shouldShowDropdown) {
            closeDropdown()
        } else {
            dispatch('setException', true)
            dropdownID = indexIndex
        }
    }

    const onDropdownInput = inputHandlerFactory(toggleDropdown)

    $: shouldShowDropdown = dropdownID == indexIndex
    const dispatch = createEventDispatcher<{
        setException: boolean,
        delete: void,
    }>()
</script>

<div
    class="wrapper row" tabindex="0" role="button"
    on:click={onDropdownInput} on:keydown={onDropdownInput}
    aria-pressed={shouldShowDropdown}
>
    {#if shouldShowDropdown}
        <IndexDropdown
            {allColNames}
            bind:indexCols={curColNames}
            on:close={closeDropdown}
        />
    {/if}

    {#each curColNames as col, i}
        <div class="row col-data">
            <p>{col}</p>
            <IconButton extraClass="trash" on:input={() => {
                dispatch('setException', true)
                curColNames.splice(i, 1)
                curColNames = curColNames
            }}>
                <Trash2 size='0.8rem' />
            </IconButton>
        </div>
    {/each}

    <div class="pad" />
    <IconButton extraClass="plus" on:input={toggleDropdown}>
        <Plus size='1rem' />
    </IconButton>
    <IconButton extraClass="trash" on:input={() => dispatch('delete')}>
        <Trash2 size='1rem' />
    </IconButton>
</div>

<style lang="scss">
    @use '$lib/utils/multi_index' as ind;
    @use '$lib/utils/input';

    .wrapper {
        cursor: pointer;
        transition: 0.5s;
        position: relative;

        @include ind.wrapper;

        &:focus-visible, &:hover {
            outline: $primary 1px solid;
        }

        .pad {
            flex-grow: 1;
        }

        .col-data {
            gap: 4px;

            @include ind.col-data(0.8rem);
        }

        @include input.forceIconColor($danger, 'trash');
        @include input.forceIconColor($primary, 'plus');
    }
</style>