<script lang="ts">
	import { allSQLTypes, tables } from "$lib/data";
	import IconButton from "$lib/IconButton.svelte";
	import { IndexType, type Index } from "$lib/types";
	import { createEventDispatcher } from "svelte";
	import { GripVertical, Ghost, Trash2 } from "lucide-svelte";
	import IndexPopup from "./IndexPopup.svelte";
	import IndexIcon from "./IndexIcon.svelte";

    export let tableName: string

    export let singleIndex: Index | undefined

    export let colIndex: number
    export let indexPopup: number

    const dispatch = createEventDispatcher<{
        setName: string,
        delete: void,
        setIndex: IndexType
    }>()

    let colNameIsGood = true
    export let colNameValue: string

    function onNameInput(re: Event) {
        // typescript, am i right?
        const e = re as InputEvent & { target: HTMLInputElement }

        const newName = e.target.value
        if (!newName || newName.includes(" ")) {
            colNameIsGood = false

            return
        }

        colNameIsGood = true
        dispatch('setName', colNameValue)
    }
</script>

<div class="col-data">
    <GripVertical size={18} color="white" />
    <input
        class="{colNameIsGood ? '' : 'bad'}"
        placeholder="Column Name"
        type="text"
        bind:value={colNameValue}
        on:input={onNameInput}
    />

    <select bind:value={$tables[tableName].cols[colIndex].type}>
        {#each allSQLTypes as typeGroup}
            <optgroup label={typeGroup[0]}>
                {#each typeGroup[1] as t}
                    <option value="{t.name}">{t.name}</option>
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
        />
    {/if}

    <IconButton
        extraClass="ind"
        active={!!singleIndex}
        on:input={() => {
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
    
    <IconButton
        extraClass="trash"
        active={true}
        on:input={() => dispatch('delete')}
    >
        <Trash2 size={18} class="trash" />
    </IconButton>
</div>

<style lang="scss">
    @use "sass:list";

    .col-data {
        display: grid;
        position: relative;

        justify-items: center;
        align-items: center;
        gap: 4px;

        //                   draggable
        grid-template: 1fr / 24px
        //                   col name, type, args (1), args (2)
                             12ch      12ch  2ch     2ch
                             // empty space  
                             1fr
        //                   nullable, index type, trash
                             repeat(3, 26px);
    }

    input, select {
        border: none;
        background: $gray-9;
        padding: 0.25rem 0.5rem;
        width: 100%;
        border-radius: 6.25px;
        color: $primary;
        --outline-color: #{$primary};

        &:focus-within {
            outline: var(--outline-color) 1px solid;
        }
    }

    input.bad {
        --outline-color: #{$danger};
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
    }
</style>