<script lang="ts">
	import { IndexType } from "$lib/types";
	import { Snowflake, Bookmark, Circle, KeyRound, type IconProps } from "lucide-svelte";
	import type { SvelteComponent } from "svelte";

    export let type: IndexType
    export let size: number
    export let active = false

    const icons:Record<IndexType, typeof SvelteComponent<IconProps>> = {
        [IndexType.NONE]: Circle,
        [IndexType.INDEX]: Bookmark,
        [IndexType.UNIQUE]: Snowflake,
        [IndexType.PRIMARY]: KeyRound,
    }
</script>

<svelte:component
    this={icons[type]}
    {size}
    class="{active ? 'primary' : 'secondary'}"
/>
