<script lang="ts">
    export let thick = false
</script>

<hr class:thick />

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
