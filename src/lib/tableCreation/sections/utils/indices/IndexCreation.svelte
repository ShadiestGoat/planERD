<script lang="ts">
    import { tables } from "$lib/dal/data"
    import { Trash2, Plus } from "lucide-svelte"
    import IndexDropdown from "./IndexDropdown.svelte"
    import IconButton from "$lib/IconButton.svelte"
    import { inputHandlerFactory } from "$lib/input"
    import { createEventDispatcher } from "svelte"
    import { multiColIndexExceptions } from "$lib/dal/tmpData"

    // The index of the index we are editing
    export let indexIndex: number
    export let tableName: string
    export let dropdownID: number
    export let curColNames: string[]

    $: allColNames = $tables[tableName].cols.map(c => c.name)

    function addException(): void {
        $multiColIndexExceptions[tableName].add(indexIndex)
        $multiColIndexExceptions[tableName] = $multiColIndexExceptions[tableName]
    }
    function rmException(): void {
        $multiColIndexExceptions[tableName].delete(indexIndex)
        $multiColIndexExceptions[tableName] = $multiColIndexExceptions[tableName]
    }

    function closeDropdown(): void {
        dropdownID = -1

        if (curColNames.length >= 2) {
            rmException()
        }
    }

    function toggleDropdown(): void  {
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

                    if (curColNames.length <= 2) {
                        addException()
                    }

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