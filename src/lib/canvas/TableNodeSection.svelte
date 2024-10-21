<script lang="ts" generics="T, P extends Record<string, unknown>">
    import Separator from '$lib/utils/Separator.svelte'
    import type { SvelteComponent } from 'svelte'

    export let data: T[]
    export let restOfTheData = {} as P
    export let comp: typeof SvelteComponent<{ data: T } & P>
</script>

{#if data.length}
    <Separator thick />

    {#each data as d, i}
        <svelte:component this={comp} data={d} {...restOfTheData} sectionIndex={i} />

        {#if data.length - 1 != i}
            <Separator />
        {/if}
    {/each}
{/if}
