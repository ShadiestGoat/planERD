<script lang="ts">
    import { SvelteFlowProvider } from '@xyflow/svelte'
    import '../app.scss'
    import '@fontsource/roboto'
</script>

<div style="height: 100dvh; width: 100dvw">
    <SvelteFlowProvider>
        <slot />
    </SvelteFlowProvider>
</div>
