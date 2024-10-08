<script lang="ts" generics="T, P extends Record<string, unknown>">
    import type { SvelteComponent } from "svelte"

    export let data: T[]
    export let restOfTheData = {} as P
    export let comp: typeof SvelteComponent<{ data: T } & P>
</script>

{#if data.length}
    <hr class="thick" />

    {#each data as d, i}
        <svelte:component data={d} {...restOfTheData} this={comp} />

        {#if data.length - 1 != i}
            <hr />
        {/if}
    {/each}
{/if}

<style lang="scss">
    hr {
        height: 2px;
        padding: 0;
        margin: 0;
        border: 0;
        background-color: $gray-8;
        width: 100%;
        grid-column-start: 1;
        grid-column-end: -1;
        border-radius: 25px;

        &.thick {
            height: 4px;
        }
    }
</style>