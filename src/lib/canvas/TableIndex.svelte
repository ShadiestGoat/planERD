<script lang="ts">
    import IndexIcon from '$lib/IndexIcon.svelte'
    import { type Index } from '$lib/types'
    import { ICON_SIZE } from '.'

    export let data: Index
</script>

<div class="index-icon-wrapper">
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
    @use '$lib/utils/multi_index' as ind;

    $border-radius: 12.5px;
    $padding: 3px 6px;

    .index-icon-wrapper {
        align-self: center;
    }

    .wrapper {
        grid-column-start: 2;
        grid-column-end: -1;
        height: 100%;
        justify-content: space-evenly;

        @include ind.wrapper;

        .col-data {
            flex-grow: 1;

            @include ind.col-data(calc(vars.$font-size * 0.65));
        }
    }
</style>
