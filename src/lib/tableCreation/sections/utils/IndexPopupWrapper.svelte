<script lang="ts">
    import { indexPopupID } from "$lib/dal/tmpData"
    import IconButton from "$lib/IconButton.svelte"
    import IndexIcon from "$lib/IndexIcon.svelte"
    import { IndexType } from "$lib/types"
    import { createEventDispatcher } from "svelte"
    import IndexPopup from "./cols/IndexPopup.svelte"

    export let id: string
    export let indexType: IndexType
    export let direction: 'left' | 'right'
    export let iconSize: string | number
    export let allowSettingNone = false

    $: isPreset = indexType != IndexType.NONE

    const dispatch = createEventDispatcher<{ setIndex: IndexType }>()
</script>

<IconButton
    extraClass="ind"
    active={isPreset}
    on:input={({ detail: e }) => {
        e.stopPropagation()

        if ($indexPopupID == id) {
            $indexPopupID = ""
        } else {
            $indexPopupID = id
        }
    }}
>
    <IndexIcon
        size={iconSize}
        active={isPreset}
        type={indexType}
    />
</IconButton>

{#if id == $indexPopupID}
    <IndexPopup
        {allowSettingNone}
        curIndexType={indexType}
        on:input={({ detail }) => {
            dispatch('setIndex', detail)
            $indexPopupID = ""
        }}
        {direction}
        on:close={() => ($indexPopupID = "")}
    />
{/if}