<script lang="ts">
    import IndexIcon from "$lib/tableCreation/IndexIcon.svelte"
    import { type Index } from "$lib/types"
    import { ICON_SIZE } from "."

    export let data: Index
</script>

<div class="index">
    <IndexIcon size={ICON_SIZE} type={data.type} active />
</div>

<div class="row wrapper">
    {#each data.colNames as col}
        <div class="col col-data">
            <p>{col}</p>
        </div>
    {/each}
</div>

<style lang="scss">
    @use 'vars';
    @use 'sass:math';

    $border-radius: 12.5px;
    $padding: 3px 6px;

    .index {
        align-self: center;
    }

    .wrapper {
        grid-column-start: 2;
        grid-column-end: -1;

        height: 100%;
        width: 100%;
        background: $gray-8;
        border-radius: $border-radius;
        padding: math.div($border-radius, 2);

        gap: 2px 4px;

        flex-wrap: wrap;
        justify-content: space-evenly;

        .col-data {
            padding: $padding;

            border-radius: $border-radius;
            background-color: $gray-9;

            align-items: center;
            justify-content: center;

            flex-grow: 1;
        }

        p {
            font-size: calc(vars.$font-size * 0.65);
        }
    }
</style>